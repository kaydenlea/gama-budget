import { ImageResponse } from "next/og";
import { SocialImageCard } from "../src/components/SocialImageCard";

export const alt = "Gama decision-first personal finance preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialImageCard />, size);
}
