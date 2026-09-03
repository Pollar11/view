import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-rail flex-col items-center px-5 py-40 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[0.02em]">
        This page went dark.
      </h1>
      <Link href="/" className="tsl-btn tsl-btn-solid mt-8">
        Back home
      </Link>
    </div>
  );
}
