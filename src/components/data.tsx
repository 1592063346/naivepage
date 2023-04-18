import { getMin } from "./compare";

export const MAX_LEVEL = 15;

// 四叶草系数
export const cloverMul: {[key: string]: number} = {
  "1": 1.2,
  "2": 1.4,
  "3": 1.8,
  "4": 2.0,
  "5": 2.4
};

// 0 的地方并非一定满足概率是 0，而可能是根本用不到。
const PROB: number[][] = [
  /*main*/ /*sub*/ //   0       1       2       3       4       5       6       7       8       9      10      11      12      13      14      15
  /*  0 */        [     1,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0],  
  /*  1 */        [  0.88,      1,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  2 */        [0.6083,  0.792, 0.9683,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  3 */        [     0, 0.4292,   0.55, 0.6858,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  4 */        [     0,      0, 0.2417, 0.4033,  0.495,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  5 */        [     0,      0,      0, 0.2008,   0.33, 0.3958,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  6 */        [     0,      0,      0,      0,  0.132,  0.264, 0.3192,      0,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  7 */        [     0,      0,      0,      0,      0,  0.106,  0.212, 0.2642,      0,      0,      0,      0,      0,      0,      0,      0],
  /*  8 */        [     0,      0,      0,      0,      0,      0,   0.06,  0.132,   0.22,      0,      0,      0,      0,      0,      0,      0],
  /*  9 */        [     0,      0,      0,      0,      0,      0,      0,  0.022,  0.045,  0.135,      0,      0,      0,      0,      0,      0],
  /* 10 */        [     0,      0,      0,      0,      0,      0,      0,      0,  0.018,  0.044,  0.125,      0,      0,      0,      0,      0],
  /* 11 */        [     0,      0,      0,      0,      0,      0,      0,      0,      0,  0.017,  0.043,  0.116,      0,      0,      0,      0],
  /* 12 */        [     0,      0,      0,      0,      0,      0,      0,      0,      0,      0, 0.0156, 0.0398,  0.107,      0,      0,      0],
  /* 13 */        [     0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0, 0.0141, 0.0367,  0.101,      0,      0],
  /* 14 */        [     0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0, 0.0126, 0.0336,  0.095,      0],
];

// bar 是降序的
export const getProb = (foo: number, bar: number[], mul: number) => {
  let result: number = PROB[foo][bar[0]];
  if (bar.length > 1) {
    result += PROB[foo][bar[1]] / 3;
  }
  if (bar.length > 2) {
    result += PROB[foo][bar[2]] / 3;
  }
  return getMin(result * mul, 1.0);
};