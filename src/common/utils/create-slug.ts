import slugify from 'slugify';


export default function createSlug(input: string): string {
  return slugify(input.trim(), {
    lower: true,
    strict: true
  });
}
