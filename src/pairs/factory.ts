/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Factory, Pair, Token } from "../../generated/schema";
import { PairCreated } from "../../generated/Factory/Factory";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from "./utils/bep20";

// Constants
let FACTORY_ADDRESS = "0xA5Ba037Ec16c45f8ae09e013C1849554C01385f5";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

export function handlePairCreated(event: PairCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) {
    // Factory
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalPairs = ZERO_BI;
    factory.totalTokens = ZERO_BI;
  }
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);

  let token0 = Token.load(event.params.token0.toHex());
  if (token0 === null) {
    // Token0
    token0 = new Token(event.params.token0.toHex());
    token0.name = fetchTokenName(event.params.token0);
    token0.symbol = fetchTokenSymbol(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);
    if (decimals === null) {
      return;
    }
    token0.decimals = decimals;

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  let token1 = Token.load(event.params.token1.toHex());
  if (token1 === null) {
    // Token1
    token1 = new Token(event.params.token1.toHex());
    token1.name = fetchTokenName(event.params.token1);
    token1.symbol = fetchTokenSymbol(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);
    if (decimals === null) {
      return;
    }
    token1.decimals = decimals;

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  // Pair
  let pair = new Pair(event.params.pair.toHex());
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.name = token0.symbol.concat("-").concat(token1.symbol);
  pair.hash = event.transaction.hash;
  pair.block = event.block.number;
  pair.timestamp = event.block.timestamp;

  // Entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();
}
