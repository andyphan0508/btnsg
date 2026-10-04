/** Bản đồ nhúng + link chỉ đường Google Maps từ địa chỉ chỉnh trong dashboard. */
export const mapLinks = (church) => {
  const query = encodeURIComponent(church.mapQuery || church.address);
  return {
    embed: `https://www.google.com/maps?q=${query}&hl=vi&z=17&output=embed`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  };
};
