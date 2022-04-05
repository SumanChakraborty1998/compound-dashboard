import React, { useEffect, useState } from "react";
import Compound from "@compound-finance/compound-js";
import { calculateApy } from "./../helper/helper";

export const Home = () => {
  const [apys, setApys] = useState([]);
  const handleGetAllApys = async () => {
    await Promise.all([
      calculateApy(Compound.cDAI, "DAI"),
      calculateApy(Compound.cUSDC, "USDC"),
      calculateApy(Compound.cUSDT, "USDT"),
    ]).then((res) =>
      setApys(
        res.map((item, index) => {
          return {
            ...item,
            image: `${index}.png`,
          };
        }),
      ),
    );
  };

  console.log(apys);

  useEffect(() => handleGetAllApys(), []);

  return (
    <div>
      {apys.length > 0 && (
        <table
          style={{
            border: "2px solid black",
            padding: "10px 1px",
            margin: "auto",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th>NAME</th>
              <th>SUPPLY APY</th>
              <th>COMP APY</th>
            </tr>
          </thead>
          <tbody>
            {apys.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.ticker}</td>
                  <td>{item.supplyApy}</td>
                  <td>{item.compApy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
