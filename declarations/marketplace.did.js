export const idlFactory = ({ IDL }) => {
  const AccecptRequest = IDL.Record({
    who: IDL.Principal,
    tokenId: IDL.Nat
  });
  const Price = IDL.Nat64;
  const Time = IDL.Int;
  const TranscationResult = IDL.Record({
    to: IDL.Principal,
    tokenId: IDL.Nat,
    from: IDL.Principal,
    commission: Price,
    nftTxIndex: IDL.Nat,
    timestamp: Time,
    price: Price,
    marketplaceTxIndex: IDL.Nat
  });
  const Errors = IDL.Variant({
    ICPTranscationFailed: IDL.Null,
    QueryArchiveError: IDL.Null,
    InvalidBlock: IDL.Null,
    InvalidPayer: IDL.Null,
    BreakAtomicity: IDL.Null,
    FatalError: IDL.Null,
    NFTTranscationFailed: IDL.Null,
    InvalidMemo: IDL.Null,
    InvalidOffer: IDL.Null,
    InvalidOwner: IDL.Null,
    InvalidSender: IDL.Null,
    InvalidOperation: IDL.Null,
    InvalidOperator: IDL.Null,
    InsufficientFunds: IDL.Null
  });
  const Result_6 = IDL.Variant({ Ok: TranscationResult, Err: Errors });
  const OfferType = IDL.Variant({ Buy: IDL.Null, Sell: IDL.Null });
  const CancelRequest = IDL.Record({
    offerType: OfferType,
    tokenId: IDL.Nat
  });
  const Result_5 = IDL.Variant({ Ok: IDL.Nat, Err: Errors });
  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const Price__2 = IDL.Nat64;
  const OfferPayLoad = IDL.Record({ tokenId: IDL.Nat, price: Price__2 });
  const TokenType = IDL.Variant({ ICP: IDL.Null });
  const DepositRequest = IDL.Record({
    blockId: IDL.Nat64,
    memo: IDL.Nat64,
    tokenType: TokenType,
    price: Price
  });
  const Result = IDL.Variant({ Ok: IDL.Nat64, Err: Errors });
  const Operation__1 = IDL.Variant({
    CreateBuyOffer: IDL.Null,
    Refund: IDL.Null,
    CancelBuyOffer: IDL.Null,
    AcceptBuyOffer: IDL.Null,
    CancelSellOffer: IDL.Null,
    CreateSellOffer: IDL.Null,
    AcceptSellOffer: IDL.Null
  });
  const Price__1 = IDL.Nat64;
  const ListingRecord = IDL.Record({
    op: Operation__1,
    tokenIndex: IDL.Nat,
    from: IDL.Principal,
    timestamp: Time,
    caller: IDL.Principal,
    index: IDL.Nat,
    price: Price__1
  });
  const Result_2 = IDL.Variant({ Ok: IDL.Principal, Err: IDL.Text });
  const Result_4 = IDL.Variant({ Ok: IDL.Text, Err: IDL.Text });
  const OfferPriceInfo = IDL.Record({
    tokenId: IDL.Opt(IDL.Nat),
    price: IDL.Opt(Price)
  });
  const Result_1 = IDL.Variant({ Ok: IDL.Float64, Err: IDL.Text });
  const TranscationOperation = IDL.Variant({
    Withdraw: IDL.Null,
    Deposit: IDL.Null
  });
  const TokenType__1 = IDL.Variant({ ICP: IDL.Null });
  const TranscationRecord = IDL.Record({
    op: TranscationOperation,
    blockId: IDL.Nat64,
    memo: IDL.Nat64,
    timestamp: Time,
    tokenType: TokenType__1,
    caller: IDL.Principal,
    index: IDL.Nat,
    price: Price__1
  });
  const Operation = IDL.Variant({
    Burn: IDL.Record({ from: IDL.Vec(IDL.Nat8), amount: Tokens }),
    Mint: IDL.Record({ to: IDL.Vec(IDL.Nat8), amount: Tokens }),
    Transfer: IDL.Record({
      to: IDL.Vec(IDL.Nat8),
      fee: Tokens,
      from: IDL.Vec(IDL.Nat8),
      amount: Tokens
    })
  });
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
  const Transaction = IDL.Record({
    memo: IDL.Nat64,
    operation: IDL.Opt(Operation),
    created_at_time: TimeStamp
  });
  const Block = IDL.Record({
    transaction: Transaction,
    timestamp: TimeStamp,
    parent_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
  });
  const Result_3 = IDL.Variant({ Ok: IDL.Vec(Block), Err: Errors });
  const WithdrawRequest = IDL.Record({
    tokenType: TokenType,
    price: Price
  });
  const Marketplace = IDL.Service({
    acceptBuyOffer: IDL.Func([AccecptRequest], [Result_6], []),
    acceptSellOffer: IDL.Func([AccecptRequest], [Result_6], []),
    availableCycles: IDL.Func([], [IDL.Nat], ["query"]),
    cancelOffer: IDL.Func([CancelRequest], [Result_5], []),
    canisterBalance: IDL.Func([], [Tokens], []),
    createBuyOffer: IDL.Func([OfferPayLoad], [Result_5], []),
    createSellOffer: IDL.Func([OfferPayLoad], [Result_5], []),
    deposit: IDL.Func([DepositRequest], [Result], []),
    getAllActivities: IDL.Func([], [IDL.Vec(ListingRecord)], ["query"]),
    getAllBuyOffers: IDL.Func([IDL.Nat], [IDL.Vec(ListingRecord)], ["query"]),
    getAllSellOffers: IDL.Func([IDL.Nat], [IDL.Vec(ListingRecord)], ["query"]),
    getCurrentBuyOffers: IDL.Func([IDL.Nat], [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Tuple(Price, Time)))], ["query"]),
    getCurrentSellOffers: IDL.Func([IDL.Nat], [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Tuple(Price, Time)))], ["query"]),
    getDealHistory: IDL.Func([IDL.Nat], [IDL.Vec(ListingRecord)], ["query"]),
    getEscrow: IDL.Func([], [IDL.Nat64], ["query"]),
    getFeeReceiver: IDL.Func([], [Result_2], ["query"]),
    getFeeReceiver_aid: IDL.Func([], [Result_4], ["query"]),
    getHighestBuyOffer: IDL.Func([], [OfferPriceInfo], ["query"]),
    getLowestSellOffer: IDL.Func([], [OfferPriceInfo], ["query"]),
    getRate: IDL.Func([], [Result_1], ["query"]),
    getTokenTradingActivities: IDL.Func([IDL.Nat], [IDL.Vec(ListingRecord)], ["query"]),
    getTotalTradingVolume: IDL.Func([], [Price], ["query"]),
    getTotolBiddingVolume: IDL.Func([], [IDL.Nat64], ["query"]),
    getUserBalance: IDL.Func([IDL.Principal], [IDL.Nat64], ["query"]),
    getUserTranscationHistory: IDL.Func([IDL.Principal], [IDL.Vec(TranscationRecord)], ["query"]),
    isBiddingEqEscrow: IDL.Func(
      [],
      [
        IDL.Record({
          isEqual: IDL.Bool,
          totalBidding: IDL.Nat64,
          escrow: IDL.Nat64
        })
      ],
      ["query"]
    ),
    isDepositEqCanisterBalance: IDL.Func(
      [],
      [
        IDL.Record({
          isEqual: IDL.Bool,
          deposit: IDL.Nat64,
          canisterBalance: IDL.Nat64
        })
      ],
      []
    ),
    query_blocks: IDL.Func([IDL.Nat64, IDL.Nat64], [Result_3], []),
    query_blocks_no_archive: IDL.Func([IDL.Nat64, IDL.Nat64], [Result_3], []),
    setFeeReceiver: IDL.Func([IDL.Principal], [Result_2], []),
    setRate: IDL.Func([IDL.Float64], [Result_1], []),
    thisAID: IDL.Func([], [IDL.Text], ["query"]),
    thisCanister: IDL.Func([], [IDL.Principal], ["query"]),
    userBalance: IDL.Func([IDL.Principal], [Tokens], []),
    withdraw: IDL.Func([WithdrawRequest], [Result], [])
  });
  return Marketplace;
};
export const init = ({ IDL }) => {
  return [];
};
module.exports = { idlFactory };
