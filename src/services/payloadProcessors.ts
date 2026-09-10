export interface IPayloadProcessor {
  canHandle(type: string): boolean;
  process(payload: string): string;
}

class TextTransformProcessor implements IPayloadProcessor {
  canHandle(type: string) { return type.toLowerCase() === 'transform_text'; }
  process(payload: string) { return payload.toUpperCase(); }
}

class JsonStructureProcessor implements IPayloadProcessor {
  canHandle(type: string) { return type.toLowerCase() === 'modify_structure'; }
  process(payload: string) {
    try {
      const parsed = JSON.parse(payload);
      return JSON.stringify({ data: parsed, metadata: { processedAt: new Date() } });
    } catch {
      return payload;
    }
  }
}

const processors: IPayloadProcessor[] = [
  new TextTransformProcessor(),
  new JsonStructureProcessor()
];

export const processPayload = (type: string, payload: string): string => {
  const processor = processors.find(p => p.canHandle(type));
  return processor ? processor.process(payload) : payload;
};