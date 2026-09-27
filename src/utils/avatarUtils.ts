/**
 * Utilitário de Validação de Avatares — VagouApp (Tríade Oficial)
 * Diretriz: Eliminação de fotos de estoque genéricas (Unsplash) e adoção do ícone User (lucide-react) com stroke-[1.8]
 */

export function isValidCustomAvatar(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Rejeita fotos de estoque genéricas do Unsplash ou placeholders
  if (trimmed.includes('unsplash.com')) return false;
  if (trimmed.includes('placeholder') || trimmed.includes('default-avatar')) return false;

  // Aceita URLs reais de storage, data URLs, blobs ou CDNs dedicados
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('blob:')
  );
}
