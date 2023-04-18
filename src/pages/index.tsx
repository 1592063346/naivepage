/*
 * [TODO]: 非组件的东西其实最好丢出去，但这里只写单页面，所以先懒得了……
 */
import { Input, Space, Button, Spin, Select, Divider } from "antd";
import { useState } from "react";
import { getMax, getMin } from "../components/compare";
import { MAX_LEVEL, getProb, cloverMul } from "../components/data";

const BASE: number = 233;      /* 一个小质数 */
const MOD: number = 998244353; /* 一个大质数 */
const EPS: number = 1e-8;

const MAX_STATE_NUM = 1234567; /* 最大状态数 */

let cloverCoef: number;                 /* 四叶草系数 */
let already: number[];                  /* 初始卡片星级对应数量 */
let target: number = -1;                /* 目标星级 */
let initResult: number = -1;            /* 初始状态答案 */
let index: number = -1;                 /* 状态编号 */
let dict: {[key: number]: number} = {}; /* hash 值到状态编号的存储 */

let visit: boolean[] = new Array(MAX_STATE_NUM).fill(false);           /* 状态是否遍历 */
let result: number[] = new Array(MAX_STATE_NUM).fill(-1.0);            /* 结果 */
let bestOp: [number, number[]][] = new Array(MAX_STATE_NUM).fill([]);  /* 最优策略 */

// hash
const encode = (count: number[]) => {
  let exist: boolean = true;
  let value: number = 0;
  count.forEach((val) => {
    value = (value * BASE + val) % MOD;
  });
  if (!dict.hasOwnProperty(value)) {
    exist = false;
    dict[value] = ++index;
    if (count[target]) {
      visit[index] = true;
      result[index] = 1.5;
    }
  }
  return [exist as unknown as number, dict[value]];
};

const singleStep = (foo: number, bar: number[], count: number[], success: boolean = true) => {
  --count[foo];
  bar.forEach((value) => {
    --count[value];
  });
  if (success) {
    ++count[foo + 1];
  } else {
    ++count[foo - (foo > 5 ? 1 : 0)];
  }
};

const getAll = (count: number[]) => {
  let all = 0;
  count.forEach((value) => {
    all += value;
  })
  return all;
}

const naiveCopy = (foo: number[], bar: number[]) => {
  foo.forEach((value) => {
    bar.push(value);
  });
}

const dp = (count: number[]) => {
  let id: number = encode(count)[1];
  if (visit[id]) {
    return getMin(1.0, result[id]);
  }
  visit[id] = true;
  if (getAll(count) === 1) {
    return result[id] = 0.0;
  }
  let current: number[] = [];
  naiveCopy(count, current);
  for (let i = 0; i < 15; ++i) {
    if (!count[i]) {
      continue;
    }
    --count[i];

    // 用一张卡强化
    for (let j = i; j >= getMax(0, i - 2); --j) {
      if (count[j]) {
        let arr0: number[] = [];
        let arr1: number[] = [];
        naiveCopy(current, arr0);
        naiveCopy(current, arr1);
        let cost: number[] = [j];
        singleStep(i, cost, arr1, true);
        singleStep(i, cost, arr0, false);
        let prob: number = getProb(i, cost, cloverCoef);
        let final: number = dp(arr1) * prob + dp(arr0) * (1 - prob);
        if (final > result[id]) {
          result[id] = final;
          bestOp[id] = [i, cost];
        }
      }
    }

    // 用两张卡强化
    for (let j = i; j >= getMax(0, i - 2); --j) {
      if (count[j]) {
        --count[j];
        for (let k = j; k >= getMax(0, i - 2); --k) {
          if (count[k]) {
            let arr0: number[] = [];
            let arr1: number[] = [];
            naiveCopy(current, arr0);
            naiveCopy(current, arr1);
            let cost: number[] = [j, k];
            singleStep(i, cost, arr1, true);
            singleStep(i, cost, arr0, false);
            let prob: number = getProb(i, cost, cloverCoef);
            let final: number = dp(arr1) * prob + dp(arr0) * (1 - prob);
            if (final > result[id]) {
              result[id] = final;
              bestOp[id] = [i, cost];
            }
          }
        }
        ++count[j];
      }
    }

    // 用三张卡强化
    for (let j = i; j >= getMax(0, i - 2); --j) {
      if (count[j]) {
        --count[j];
        for (let k = j; k >= getMax(0, i - 2); --k) {
          if (count[k]) {
            --count[k];
            for (let l = k; l >= getMax(0, i - 2); --l) {
              if (count[l]) {
                let arr0: number[] = [];
                let arr1: number[] = [];
                naiveCopy(current, arr0);
                naiveCopy(current, arr1);
                let cost: number[] = [j, k, l];
                singleStep(i, cost, arr1, true);
                singleStep(i, cost, arr0, false);
                let prob: number = getProb(i, cost, cloverCoef);
                let final: number = dp(arr1) * prob + dp(arr0) * (1 - prob);
                if (final > result[id]) {
                  result[id] = final;
                  bestOp[id] = [i, cost];
                }
              }
            }
            ++count[k];
          }
        }
        ++count[j];
      }
    }
    ++count[i];
  }
  return result[id];
};

const prettyPrint = (foo: number[]) => {
  let prettyOuf = "";
  foo.forEach((value, index) => {
    if (index) {
      prettyOuf += ", ";
    }
    prettyOuf += value;
  });
  return prettyOuf;
};

const HomePage = () => {
  const [alreadyString, setAlready] = useState<string>("3 4 5 6 7");
  const [targetString, setTarget] = useState<string>("8");
  const [clover, setClover] = useState<string>("4");
  const [current, setCurrent] = useState<number[]>([]);
  const [history, setHistory] = useState<React.ReactNode[]>([]);

  const [ready, setReady] = useState<number>(0);

  const [refresher, setRefresher] = useState<boolean>(false);
  const refresh = () => setRefresher(!refresher);

  const work = () => {
    cloverCoef = cloverMul[clover];
    already = new Array(MAX_LEVEL + 1).fill(0);
    target = Number(targetString);
    alreadyString.match(/\d/g)?.forEach((value) => {
      already[Number(value)]++;
    });
    setCurrent(already);
    setReady(1);
    setHistory([]);
    initResult = dp(already);
    if (initResult >= 0) {
      setReady(2);
    }
  };

  const go = (success: boolean) => {
    let tmpHistory = history;
    tmpHistory.push(getOp(true, success));
    setHistory(tmpHistory);
    let id: number = encode(current)[1];
    let tmpCurrent = current;
    singleStep(bestOp[id][0], bestOp[id][1], tmpCurrent, success);
    setCurrent(tmpCurrent);
    refresh();
  }

  const getOp = (isHistory: boolean, success?: boolean) => {
    let id: number = encode(current)[1];
    if (result[id] > 1 + EPS) {
      return (
        <>恭喜，强化成功！</>
      );
    } else if (result[id] < EPS) {
      return (
        <>很遗憾，你已不再可能成功！</>
      );
    }
    return !isHistory ? (
      <>
        <div>当前成功概率：{getMin(1.0, result[id]) * 100}%</div>
        <div>当前的最优策略为：选择用 {prettyPrint(bestOp[id][1])} 星级的卡去强化一张 {bestOp[id][0]} 星级的卡片。</div>
        <Space direction="horizontal">
          <Button type="primary" style={{backgroundColor: "#228B22"}} onClick={() => go(true)}>强化成功</Button>
          <Button type="primary" style={{backgroundColor: "#CC0000"}} onClick={() => go(false)}>强化失败</Button>
        </Space>
      </>
    ) : (
      <div key={history.length}>
        选择用 {prettyPrint(bestOp[id][1])} 星级的卡去强化一张 {bestOp[id][0]} 星级的卡片，{success ? "成功" : "失败"}。
      </div>
    )
  };

  return (
    <>
      <Space direction="vertical">
        <Space>
          已有卡片星级（多个数字，数字之间用单个空格隔开）：
          <Input
            placeholder="输入多个数字，数字之间用单个空格隔开"
            value={alreadyString}
            onChange={(e) => setAlready(e.target.value)}
          />
        </Space>
        <Space>
          目标卡片星级（单个数字）：
          <Input
            placeholder="单个数字"
            value={targetString}
            onChange={(e) => setTarget(e.target.value)}
          />
        </Space>
        <Space>
          四叶草等级：
          <Select
            defaultValue="4"
            options={[
              { value: "1", label: "一级四叶草" },
              { value: "2", label: "二级四叶草" },
              { value: "3", label: "三级四叶草" },
              { value: "4", label: "四级四叶草" },
              { value: "5", label: "五级四叶草" },
            ]}
            onChange={(value) => setClover(value)}
          />
        </Space>
        <Button
          type="primary"
          onClick={work}
          disabled={ready === 1}
        >
          生成计算
        </Button>
      </Space>
      {
        ready === 0 ? <></> :
          ready === 1 ? <Spin /> : (
            <>
              <Divider />
              <>
                {getOp(false)}
                <Divider />
                <div style={{ fontSize: 16, fontWeight: "bold" }}>强化历史</div>
                <div>{history}</div>
              </>
            </>
          )
      }
    </>
  );
};

export default HomePage;