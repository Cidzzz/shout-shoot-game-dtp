/**
 * Collision Detection Utilities
 * AABB (Axis-Aligned Bounding Box) collision detection
 */

/**
 * Check if two rectangles collide
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} - True if colliding
 */
export function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Check if a point is inside a rectangle
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} - True if point is inside
 */
export function pointInRect(px, py, rect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}
