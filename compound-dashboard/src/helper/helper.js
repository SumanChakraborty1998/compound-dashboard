import Compound from "@compound-finance/compound-js";
// const Compound = require("@compound-finance/compound-js");

const provider =
  "https://mainnet.infura.io/v3/269928cd4303462c8605eebd125c48db";

const comptroller = Compound.util.getAddress(Compound.Comptroller);
const opf = Compound.util.getAddress(Compound.PriceFeed);

// const cTokenDecimals = 8;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;
const ethMantissa = Math.pow(10, 18);

//APY = Supply Rate + Comp Token Rate;

const calculateSupplyApy = async (cToken) => {
  const supplyRatePerBlock = await Compound.eth.read(
    cToken,
    "function supplyRatePerBlock() returns (uint)",
    [],
    { provider },
  );

  return (
    100 *
    (Math.pow(
      (supplyRatePerBlock / ethMantissa) * blocksPerDay + 1,
      daysPerYear - 1,
    ) -
      1)
  );
};

const calculateCompApy = async (cToken, ticker, underlyingDecimals) => {
  let compSpeed = await Compound.eth.read(
    comptroller,
    "function compSpeeds(address cToken) public returns (uint)",
    [cToken],
    { provider },
  );

  let compPrice = await Compound.eth.read(
    opf,
    "function price(string memory symbol) external view returns (uint)",
    [Compound.COMP],
    { provider },
  );

  let underlyingPrice = await Compound.eth.read(
    opf,
    "function price(string memory symbol) external view returns (uint)",
    [ticker],
    { provider },
  );

  let totalSupply = await Compound.eth.read(
    cToken,
    "function totalSupply() returns (uint256)",
    [],
    { provider },
  );

  let exchangeRate = await Compound.eth.read(
    cToken,
    "function exchangeRateCurrent()  returns (uint)",
    [],
    { provider },
  );

  exchangeRate = +exchangeRate.toString() / ethMantissa;
  compSpeed = compSpeed / 1e18;
  compPrice = compPrice / 1e6;
  underlyingPrice = underlyingPrice / 1e6;
  totalSupply =
    (+totalSupply.toString() * exchangeRate * underlyingPrice) /
    Math.pow(10, underlyingDecimals);
  const compPerDay = compSpeed * blocksPerDay;
  return 100 * ((compPrice * compPerDay) / totalSupply) * 365;
};

export const calculateApy = async (cToken, ticker) => {
  const underlyingDecimals = Compound.decimals[cToken.slice(1, 10)];
  const cTokenAddress = Compound.util.getAddress(cToken);

  const [supplyApy, compApy] = await Promise.all([
    calculateSupplyApy(cTokenAddress),
    calculateCompApy(cTokenAddress, ticker, underlyingDecimals),
  ]);

  // console.log({ ticker, supplyApy, compApy });

  return { ticker, supplyApy, compApy };
};
// console.log(await calculateApy(Compound.cDAI, "DAI"));
// (async () => {
//   console.log(Compound.cDAI);
//   // await calculateApy(Compound.cDAI, "DAI");
// })();
