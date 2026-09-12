import plugin from "tailwindcss/plugin";

/**
 * Tailwind plugin adding variants keyed off the `data-duo-state` attribute
 * that `DuoStateSync` sets on `<html>`:
 *
 *   <div className="duo-folded:hidden duo-unfolded:flex">...</div>
 *
 * Register in tailwind.config.js:
 *   plugins: [require("iphone-duo-responsive/tailwind")]
 */
export const iphoneDuoPlugin = plugin(({ addVariant }) => {
  addVariant("duo-folded", ':where([data-duo-state="folded"]) &');
  addVariant("duo-unfolded", ':where([data-duo-state="unfolded"]) &');
  addVariant("duo", ':where([data-duo-state="folded"], [data-duo-state="unfolded"]) &');
  addVariant("duo-unknown", ':where([data-duo-state="unknown"], [data-duo-state="not-duo"]) &');
});

export default iphoneDuoPlugin;
