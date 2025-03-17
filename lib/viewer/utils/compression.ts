/**
 * 使用 base64 和 URL 安全的字符串压缩/解压缩工具
 */

export async function compress(data: string): Promise<string> {
  try {
    // 使用TextEncoder将字符串转换为Uint8Array
    const textEncoder = new TextEncoder();
    const uint8Array = textEncoder.encode(data);
    
    // 压缩数据
    const compressed = await compressData(uint8Array);
    
    // 转换为base64并使其URL安全
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(compressed)));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress data');
  }
}

export async function decompress(data: string): Promise<string> {
  try {
    // 还原URL安全的base64
    let base64 = data
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // 添加回可能被移除的填充
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // 解码base64
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // 解压数据
    const decompressed = await decompressData(uint8Array);
    
    // 转换回字符串
    const textDecoder = new TextDecoder();
    return textDecoder.decode(decompressed);
  } catch (error) {
    console.error('Decompression error:', error);
    throw new Error('Failed to decompress data');
  }
}

async function compressData(data: Uint8Array): Promise<Uint8Array> {
  try {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    await writer.write(data);
    await writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    return new Uint8Array(compressed);
  } catch (error) {
    console.error('Data compression error:', error);
    throw new Error('Failed to compress data stream');
  }
}

async function decompressData(data: Uint8Array): Promise<Uint8Array> {
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    await writer.write(data);
    await writer.close();
    const decompressed = await new Response(ds.readable).arrayBuffer();
    return new Uint8Array(decompressed);
  } catch (error) {
    console.error('Data decompression error:', error);
    throw new Error('Failed to decompress data stream');
  }
} 