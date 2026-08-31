import {
  ARTIFACT_CUSTOM_METADATA_MAX_BYTES,
  artifactCustomMetadataByteLength
} from "../../src/artifacts/store.ts";

type Stored = {
  body: string;
  customMetadata: Record<string, string>;
  httpMetadata?: Headers | R2HTTPMetadata;
  etag: string;
};

class MemoryR2Object {
  constructor(
    readonly key: string,
    private readonly body: string,
    readonly customMetadata: Record<string, string>,
    readonly httpMetadata?: Headers | R2HTTPMetadata,
    readonly etag: string = crypto.randomUUID()
  ) {}

  async text(): Promise<string> {
    return this.body;
  }
}

export class MemoryR2Bucket {
  readonly objects = new Map<string, Stored>();

  async put(key: string, body: string, options?: R2PutOptions): Promise<R2Object | null> {
    const prior = this.objects.get(key);
    const onlyIf = options?.onlyIf instanceof Headers ? undefined : options?.onlyIf;
    if (onlyIf?.etagDoesNotMatch === "*" && prior) return null;
    if (onlyIf?.etagMatches !== undefined && prior?.etag !== onlyIf.etagMatches) return null;
    const customMetadata = options?.customMetadata ? { ...options.customMetadata } : {};
    if (artifactCustomMetadataByteLength(customMetadata) > ARTIFACT_CUSTOM_METADATA_MAX_BYTES) {
      const error = new Error("MetadataTooLarge: custom metadata exceeds 8192 bytes");
      error.name = "MetadataTooLarge";
      throw error;
    }
    const etag = crypto.randomUUID();
    this.objects.set(key, { body, customMetadata, httpMetadata: options?.httpMetadata, etag });
    return new MemoryR2Object(key, body, customMetadata, options?.httpMetadata, etag) as unknown as R2Object;
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    const stored = this.objects.get(key);
    if (!stored) return null;
    return new MemoryR2Object(
      key,
      stored.body,
      stored.customMetadata,
      stored.httpMetadata,
      stored.etag
    ) as unknown as R2ObjectBody;
  }

  async head(key: string): Promise<R2Object | null> {
    const stored = this.objects.get(key);
    if (!stored) return null;
    return new MemoryR2Object(
      key,
      stored.body,
      stored.customMetadata,
      stored.httpMetadata,
      stored.etag
    ) as unknown as R2Object;
  }
}
