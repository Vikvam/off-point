export class BlobSource {
  constructor(blob, name) {
    this.blob = blob;
    this.name = name;
  }

  getKey() {
    return this.name;
  }

  async getBytes(offset, length) {
    const data = await this.blob.slice(offset, offset + length).arrayBuffer();
    return { data };
  }
}
