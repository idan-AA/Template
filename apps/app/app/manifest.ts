import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/brand";
import { manifestOf } from "@/lib/brand-core";

export default function manifest(): MetadataRoute.Manifest {
	return manifestOf(getBrand());
}
