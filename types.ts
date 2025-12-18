
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FileData {
  name: string;
  base64: string;
  mimeType: string;
  size: number;
}
