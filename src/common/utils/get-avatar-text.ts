export default function getAvatarText(username: string): string {
  if (!username) return "";

  const words = username.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const first = words[0].charAt(0).toUpperCase();
  const second = words[1].charAt(0).toUpperCase();

  return first + second;
}
