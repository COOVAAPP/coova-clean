// app/not-found.js
export const dynamic = 'force-dynamic';
export const revalidate = false; // don't statically pre-render 404

export default function NotFound() {
  // return literally nothing so Next won't try to do any heavy work here
  return null;
}