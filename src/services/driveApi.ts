import { DriveFile } from '../types';

export function getFileCategory(mimeType: string, name: string): DriveFile['category'] {
  const lowerName = name.toLowerCase();
  const lowerMime = mimeType.toLowerCase();
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (lowerName.endsWith('.fig') || lowerName.includes('figma')) return 'figma';
  if (
    lowerMime.startsWith('image/') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.svg') ||
    lowerName.endsWith('.webp')
  )
    return 'image';
  if (
    lowerMime.startsWith('video/') ||
    lowerMime.includes('mp4') ||
    lowerMime.includes('mpeg') ||
    lowerName.endsWith('.mp4') ||
    lowerName.endsWith('.mpeg') ||
    lowerName.endsWith('.mpg') ||
    lowerName.endsWith('.mpeg4') ||
    lowerName.endsWith('.mov') ||
    lowerName.endsWith('.webm') ||
    lowerName.endsWith('.mkv') ||
    lowerName.endsWith('.avi')
  )
    return 'video';
  if (
    lowerMime.includes('pdf') ||
    lowerMime.includes('document') ||
    lowerMime.includes('presentation') ||
    lowerMime.includes('sheet') ||
    lowerName.endsWith('.pdf')
  )
    return 'document';
  return 'other';
}

export function formatBytes(bytesStr?: string): string {
  if (!bytesStr) return '--';
  const bytes = parseInt(bytesStr, 10);
  if (isNaN(bytes) || bytes === 0) return '--';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function fetchDriveFiles({
  accessToken,
  folderId = 'root',
  searchQuery = '',
  categoryFilter = 'all',
}: {
  accessToken: string;
  folderId?: string;
  searchQuery?: string;
  categoryFilter?: 'all' | 'design' | 'video' | 'folder' | 'document';
}): Promise<DriveFile[]> {
  const queryParts: string[] = ['trashed = false'];

  if (folderId && folderId !== 'all') {
    queryParts.push(`'${folderId}' in parents`);
  }

  if (searchQuery.trim()) {
    const escaped = searchQuery.replace(/'/g, "\\'");
    queryParts.push(`(name contains '${escaped}' or fullText contains '${escaped}')`);
  }

  if (categoryFilter === 'design') {
    queryParts.push(
      "(mimeType contains 'image/' or name contains '.fig' or name contains 'figma' or mimeType = 'application/pdf' or mimeType contains 'svg')"
    );
  } else if (categoryFilter === 'video') {
    queryParts.push(
      "(mimeType contains 'video/' or mimeType contains 'mp4' or mimeType contains 'mpeg' or name contains '.mp4' or name contains '.mpeg' or name contains '.mov' or name contains '.webm' or name contains '.mkv')"
    );
  } else if (categoryFilter === 'folder') {
    queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
  } else if (categoryFilter === 'document') {
    queryParts.push(
      "(mimeType contains 'document' or mimeType contains 'pdf' or mimeType contains 'spreadsheet' or mimeType contains 'presentation')"
    );
  }

  const q = queryParts.join(' and ');
  const fields =
    'files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webContentLink, webViewLink, iconLink, parents, hasThumbnail, description)';
  const orderBy = 'folder, modifiedTime desc';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=${encodeURIComponent(orderBy)}&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Erro ao carregar arquivos do Drive (${response.status})`);
  }

  const data = await response.json();
  const files: DriveFile[] = (data.files || []).map((file: any) => ({
    ...file,
    category: getFileCategory(file.mimeType, file.name),
  }));

  return files;
}

export async function fetchFileBlob(fileId: string, accessToken: string): Promise<Blob> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar o conteúdo do arquivo (${response.status})`);
  }

  return await response.blob();
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const cleanBase64 = base64String.split(',')[1] || base64String;
      resolve(cleanBase64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
