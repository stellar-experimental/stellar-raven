import {
  ARTIFACT_CUSTOM_METADATA_MAX_BYTES,
  artifactCustomMetadataByteLength
} from "../../src/artifacts/store.ts";

type Stored = {
  body: string;
  customMetadata: Record<string, string>;
  httpMetadata?: Headers | R2HTTPMetadata;
};

class MemoryR2Object {
  constructor(
    readonly key: string,
    private readonly body: string,
    readonly customMetadata: Record<string, string>,
    readonly httpMetadata?: Headers | R2HTTPMetadata
  ) {}

  async text(): Promise<string> {
    return this.body;
  }
}

export class MemoryR2Bucket {
  readonly objects = new Map<string, Stored>();

  async put(key: string, body: string, options?: R2PutOptions): Promise<R2Object> {
    const customMetadata = options?.customMetadata ? { ...options.customMetadata } : {};
    if (artifactCustomMetadataByteLength(customMetadata) > ARTIFACT_CUSTOM_METADATA_MAX_BYTES) {
      const error = new Error("MetadataTooLarge: custom metadata exceeds 8192 bytes");
      error.name = "MetadataTooLarge";
      throw error;
    }
    this.objects.set(key, { body, customMetadata, httpMetadata: options?.httpMetadata });
    return new MemoryR2Object(key, body, customMetadata, options?.httpMetadata) as unknown as R2Object;
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    const stored = this.objects.get(key);
    if (!stored) return null;
    return new MemoryR2Object(
      key,
      stored.body,
      stored.customMetadata,
      stored.httpMetadata
    ) as unknown as R2ObjectBody;
  }

  async head(key: string): Promise<R2Object | null> {
    const stored = this.objects.get(key);
    if (!stored) return null;
    return new MemoryR2Object(
      key,
      stored.body,
      stored.customMetadata,
      stored.httpMetadata
    ) as unknown as R2Object;
  }
}
