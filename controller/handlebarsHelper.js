"use strict";

const createStarList = (stars) => {
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return `<div class="rating">
    ${Array(fullStars).fill('<i class="fa fa-star"></i>').join("")}
    ${hasHalfStar ? '<i class="fa fa-star-half"></i>' : ""}
    ${Array(emptyStars).fill('<i class="fa fa-star-o"></i>').join("")}
  </div>`.replace(/\n\s+/g, "");
};

module.exports = { createStarList };
