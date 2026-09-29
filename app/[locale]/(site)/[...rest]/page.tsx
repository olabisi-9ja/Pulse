import { notFound } from "next/navigation";

/** Any unknown path under a locale renders the site's 404 inside the normal header and footer. */
export default function UnknownPage() {
  notFound();
}
