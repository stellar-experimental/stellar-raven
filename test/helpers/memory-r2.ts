// R2 counts UTF-8 bytes in both metadata keys and values, with an 8192-byte limit.
export function metadataBytes(metadata: Record<string, string>): number {
  return Object.entries(metadata).reduce(
    (sum, [key, value]) => sum + Buffer.byteLength(key, "utf8") + Buffer.byteLength(value, "utf8"),
    0
  );
}

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
    if (metadataBytes(customMetadata) > 8192) {
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
