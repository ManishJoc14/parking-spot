import { clsx } from "clsx";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <ul aria-label="Breadcrumb" className="mb-6 block">
      <ol className="flex text-xl font-mont-medium md:text-2xl">
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={uuidv4()}
            aria-current={breadcrumb.active}
            className={clsx(
              breadcrumb.active ? "text-gray-800" : "text-gray-500"
            )}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-3 inline-block">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </ul>
  );
}
