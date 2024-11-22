---
title: "[니트코드 Blind 75] Binary Search"
date: "2023-10-16"
description: " "
category: "Algorithms"
tags: ["Javascript", "PS"]
---

# 1. **Find Minimum in Rotated Sorted Array**

[LeetCode - The World's Leading Online Programming Learning Platform](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)

배열의 최솟값을 찾아 반환 하는 문제

단, O(logn)의 복잡도로 풀어야한다.

주어지는 배열은 원래 오름차순이었던 배열을 오른쪽으로 1~n번 회전시킨 배열이다.

내가 생각한 방법은

- 중간 값이 오른쪽 값 보다 크다면
  - 배열의 최솟값은 중간 값보다 오른쪽에 있을 것이므로 L값을 옮김
- 중간 값이 오른쪽 값 보다 작다면
  - 중간 값 이전에 더 작은 숫자가 있을 수 있으므로 R값을 옮김

위 방법이다.

- 코드

  ```js
  /**
   * @param {number[]} nums
   * @return {number}
   */
  var findMin = function (nums) {
    let [l, r] = [0, nums.length - 1];
    let m = 0;
    while (l < r) {
      m = Math.floor((l + r) / 2);

      if (nums[m] > nums[r]) {
        l = m + 1;
      } else if (nums[m] < nums[r]) {
        r = m;
      }
    }

    return nums[l];
  };
  ```

# 2. **Search in Rotated Sorted Array**

[Search in Rotated Sorted Array - LeetCode](https://leetcode.com/problems/search-in-rotated-sorted-array/)

회전된 오름차순 배열에서 특정 값의 인덱스를 찾는 문제

접근법은 다음과 같다.

- L = 왼쪽 값, R = 오른쪽 값, M = 중간 값
- M값이 타겟인지 확인한다. 이 경우 M 리턴
- M 값을 기준으로 타겟이 왼쪽 파트에 있는지 오른쪽 파트에 있는지 찾는다.

  - 왼쪽 파트에 있다면 R 값을 옮겨서 다시 탐색
    - nums[L] ≤ nums[M] 이면 왼쪽 파트는 정렬이 되어 있는 상태
    - target > nums[M]이거나 target < nums[L]이면 왼쪽 파트에 target이 없으므로 오른쪽 파트를 탐색해야 한다. ⇒ L = M + 1
    - 그 외에는 왼쪽 파트에 있는 것이므로 R = M - 1
  - 오른쪽 파트에 있다면 L 값을 옮겨서 다시 검색
    - nums[L] ≤ nums[M]이 아니었다면 왼쪽 파트는 정렬이 되어 있지 않다. 그러므로 오른쪽 파트는 무조건 정렬이 되어 있다.
    - target < nums[M]이거나 target > nums[R]이면 왼쪽 파트를 탐색해야 한다. ⇒ R = M - 1
    - 그 외에는 오른쪽 파트에 있는 것이므로 L = M + 1

- 코드

  ```js
  /**
   * @param {number[]} nums
   * @param {number} target
   * @return {number}
   */
  var search = function (nums, target) {
    let [l, r] = [0, nums.length - 1];

    while (l <= r) {
      let m = Math.floor((l + r) / 2);

      if (target === nums[m]) {
        return m;
      }

      // left sorted portion
      if (nums[l] <= nums[m]) {
        if (target > nums[m] || target < nums[l]) {
          l = m + 1;
        } else {
          r = m - 1;
        }
      } else {
        // right sorted portion
        if (target < nums[m] || target > nums[r]) {
          r = m - 1;
        } else {
          l = m + 1;
        }
      }
    }

    return -1;
  };
  ```
