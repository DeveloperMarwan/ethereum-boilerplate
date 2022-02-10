import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Account from "components/Account/Account";
import Chains from "components/Chains";
import TokenPrice from "components/TokenPrice";
import ERC20Balance from "components/ERC20Balance";
import ERC20Transfers from "components/ERC20Transfers";
// import DEX from "components/DEX";
import NFTBalance from "components/NFTBalance";
// import Wallet from "components/Wallet";
import { Layout, Tabs, Card, Input, Button, List } from "antd";
import "antd/dist/antd.css";
import NativeBalance from "components/NativeBalance";
import "./style.css";
// import QuickStart from "components/QuickStart";
import Contract from "components/Contract/Contract";
import Text from "antd/lib/typography/Text";
import Ramper from "components/Ramper";
import MenuItems from "./components/MenuItems";
import { SALIENT_YACHT_NFT_ADDR, SALIENT_YACHT_NFT_ABI, SALIENT_YAGHT_STREAM_ABI, CHAINLINK_AVAX_USD_ADDR, CHAINLINK_AGGREGATORV3_INTERFACE_ABI } from "./constants";
import { ConsoleSqlOutlined } from "@ant-design/icons";
//import Moralis from "moralis/types";
const { Header, Footer } = Layout;

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};

function App ({ isServerInfo }) {
  const { Moralis, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
      enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  const [noOfNfts, setNoOfNfts] = useState(0);
  const [nftType, setNftType] = useState(0); //0: Common, 1: Rare, 2: Ultra Rare 
  const [nftTxnAmount, setNftTxnAmount] = useState(0n);
  const [streamContractAddr, setStreamContractAddr] = useState();
  const [userStreams, setUserStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [withdrawalAmt, setWithdrawalAmt] = useState(0);
  const [streamsData, setStreamsData] = useState([]);
  const [currentNftPrice, setCurrentNftPrice] = useState(0);
  const [affiliateId, setAffiliateId] = useState("");

  const nftContractOptions = {
    contractAddress: SALIENT_YACHT_NFT_ADDR,
    abi: SALIENT_YACHT_NFT_ABI,
  };

  const streamContractOptions = {
    contractAddress: streamContractAddr,
    abi: SALIENT_YAGHT_STREAM_ABI,
  };

  const chainlinkOptions = {
    contractAddress: CHAINLINK_AVAX_USD_ADDR,
    abi: CHAINLINK_AGGREGATORV3_INTERFACE_ABI,
  };
    
  return (
    <Layout style={{ height: "100vh", overflow: "auto" }}>
      <Router>
        <Header style={styles.header}>
          <Logo />
          <MenuItems />
          <div style={styles.headerRight}>
            <Chains />
            <TokenPrice
              address="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
              chain="eth"
              image="https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/"
              size="40px"
            />
            <NativeBalance />
            <Account />
          </div>
        </Header>
        <div style={styles.content}>
          <Switch>
            <Route path="/salientyachtsnft">
              <Card title="Salient Yachts" size="large" style={{ marginTop: 5, width: "100%" }}>
                <div>
                  <Button onClick={async () => {
                    const latestPrice = await Moralis.executeFunction({ functionName : 'latestRoundData', 
                      params : {}, ...chainlinkOptions });
                    console.log("----> latestPrice: ", latestPrice);
                    if (latestPrice.answer) {
                      const price = Number(latestPrice.answer) / (10 ** 8);
                      console.log("-----> 1 AVAX = ", price, " USD");
                      console.log("-----> 1 USD    = ", 1 / price, " AVAX");
                      console.log("-----> 10 USD   = ", 10 / price, " AVAX");
                      console.log("-----> 100 USD  = ", 100 / price, " AVAX");
                      // remember to multiply the above price by 10 ** 18 to convert it to wei.
                    }
                  }}>Get AVAX/USD Price From ChainLink</Button>
                </div>
                <div>
                  <Button onClick={async () => {
                    const remainingNFTBalance = await Moralis.executeFunction({ functionName : 'getRemainingNFTBalance', 
                      params: {}, ...nftContractOptions});
                    console.log("----> remainingNFTBalance: " + remainingNFTBalance);
                  }}>Get Remaining NFT Balance</Button>
                </div>
                <div>Which NFT (0 = Common, 1 = Rare, 2 = Ultra Rare: <Input size="large" type="number" value={nftType} onChange={e => setNftType(e.target.value)} /></div>
                <div>How Many NFT's: <Input size="large" type="number" value={noOfNfts} onChange={e => setNoOfNfts(e.target.value)} /></div>
                <div>Payment (AVAX): <Input size="large" type="number" value={nftTxnAmount} onChange={e => setNftTxnAmount(e.target.value)} /></div>
                <div>Affilaite Id (optional): <Input size="large" type="text" value={affiliateId} onChange={e => setAffiliateId(e.target.value)} /></div>
                <div><Button onClick={async () => {
                  console.log("----> noOfNfts     = ", noOfNfts);
                  console.log("----> nftTxnAmount = ", nftTxnAmount);
                  console.log("----> affiliateId  = ", affiliateId);
                  // const nftTxnAmountInWei = Moralis.Units.ETH(nftTxnAmount + "");
                  // console.log("----> nftTxnAmountInWei = ", nftTxnAmountInWei);
                  const nftTxnResult = await Moralis.executeFunction({ functionName: 'buyYachtNFT', msgValue: nftTxnAmount, 
                  params: {
                    numberOfTokens: noOfNfts,
                    nftType: nftType,
                    affiliateId: affiliateId,
                  },...nftContractOptions });
                  console.log("----> nftTxnResult = ", nftTxnResult);
                  console.log("----> currentNftPrice = ", currentNftPrice);
                }}>Buy NFT's</Button></div>
              </Card>
            </Route>
            <Route path="/salientyachtrewards">
              <Card title="Salient Yachts Rewards" size="large" style={{ marginTop: 25, width: "100%" }}>
                <div style={{ marginTop: 5, width: "100%" }}>
                  <Button onClick={async () => {
                      //get the stream contract address
                      const rewardAddress = await Moralis.executeFunction({ functionName: 'streamContract', params:{}, ...nftContractOptions });
                      console.log("----> rewardAddress = ", rewardAddress);
                      setStreamContractAddr(rewardAddress);

                      //query Moralis's event table RewardStreamCreatedEvent to get the list of streams for the current user
                      const currentUser = Moralis.User.current();
                      console.log("-----> currentUser.ethAddress: ", currentUser.get("ethAddress"));

                      const streamEvtTbl = Moralis.Object.extend("SYONEStreamCreatedVTwo");
                      const query = new Moralis.Query(streamEvtTbl);
                      query.equalTo("recipient", currentUser.get("ethAddress").toLowerCase());
                      query.equalTo("sender", SALIENT_YACHT_NFT_ADDR.toLowerCase());
                      const qtyResult = await query.find();
                      console.log("qtyResult ", qtyResult);
                      console.log("Successfully retrieved ", qtyResult.length, " Stream records.");
                      //setUserStreams([]);
                      console.log('object.id - nftTokenId - streamId');
                      for (let i = 0; i < qtyResult.length; i++) {
                        const object = qtyResult[i];
                        console.log(object.id, ' - ', object.get('nftTokenId'), ' - ', object.get('streamId'));
                        userStreams.push(object.get('streamId'));
                      }
                      console.log("-----> userStreams: " + JSON.stringify(userStreams));
                  }}>Get Reward Streams</Button>
                  {/*streamsDisplay*/}
                </div>
                {/* get all streams data */}
                <div style={{ marginTop: 5, width: "100%" }}>
                  <Button onClick={async () => {
                    console.log("----> userStreams(length): " + userStreams.length);
                    if (userStreams.length > 0) {
                      for (let i = 0; i < userStreams.length; i++) {
                        const aStream = userStreams[i];
                        const aStreamData = await Moralis.executeFunction({ functionName: 'getStream', 
                          params: {
                            streamId: aStream
                          }, 
                          ...streamContractOptions
                        });
                        console.log("-----> aStreamData: " + JSON.stringify(aStreamData));
                        streamsData.push(aStreamData);
                      }
                    }                    
                  }}>Get Streams Data</Button>
                </div>
                <div>Selected Stream: <Input size="large" type="number" value={selectedStream} onChange={e => setSelectedStream(e.target.value)} /></div>
                <div style={{ marginTop: 5, width: "100%" }}>
                  {/* get the balace for the selected stream*/}
                  <Button onClick={async () => {
                    console.log("-----> selectedStream: " + selectedStream);
                    const currentUser = Moralis.User.current();
                    const streamBalance = await Moralis.executeFunction({ functionName: 'balanceOf', 
                      params:{
                        streamId: selectedStream,
                        who: currentUser.get("ethAddress")
                      }, 
                      ...streamContractOptions 
                    });
                    console.log("----> streamBalance: " + streamBalance);               
                  }}>Get Stream Balance</Button>
                </div>
                <div style={{ marginTop: 5, width: "100%" }}>
                  {/* withdraw from the selected stream*/}
                  <div>Withdrawal Amount: <Input size="large" type="number" value={withdrawalAmt} onChange={e => setWithdrawalAmt(e.target.value)} /></div>
                  <div>
                  <Button onClick={async () => {
                    console.log("-----> selectedStream: " + selectedStream);
                    const withdrawalResult = await Moralis.executeFunction({ functionName: 'withdrawFromStream',
                      params: {
                        streamId: selectedStream,
                        amount: Moralis.Units.ETH(withdrawalAmt + "")
                      },
                      ...streamContractOptions 
                    });
                  }}>Withdraw From Stream</Button>
                  </div>
                </div>
                <div style={{ marginTop: 5, width: "100%" }}>
                  {/* get balance of streams */}
                  <Button onClick={async () => {
                    console.log("----> userStreams(length): " + userStreams.length);
                    console.log("----> userStreams: " + JSON.stringify(userStreams));
                    const currentUser = Moralis.User.current();
                    console.log("----> currentUser.get('ethAddress'): " + currentUser.get("ethAddress"));
                    if (userStreams.length > 0) {
                      const userStreamsIdList = userStreams.map(Number);
                      console.log("-----> userStreamsIdList: " + JSON.stringify(userStreamsIdList));
                      // executeFunction
                      // runContractFunction
                      
                      const balaceOfStreams = await Moralis.executeFunction({ functionName: 'balanceOfStreams', 
                        params: {
                          streamIdList: userStreams,
                          who: currentUser.get("ethAddress")
                        }, 
                        ...streamContractOptions
                      });
                      console.log("----> balaceOfStreams: " + JSON.stringify(balaceOfStreams));
                    }                    
                  }}>Get Balance of Streams</Button>
                </div>
                <div style={{ marginTop: 5, width: "100%" }}>
                  <Button onClick={async() => {
                    console.log("----> userStreams(length): " + userStreams.length);
                    console.log("----> userStreams: " + JSON.stringify(userStreams));
                    const currentUser = Moralis.User.current();
                    console.log("----> currentUser.get('ethAddress'): " + currentUser.get("ethAddress"));
                    if (userStreams.length > 0) {
                      const opResult = await Moralis.executeFunction({functionName: 'withdrawFromStreams',
                        params: {
                          streamIdList: userStreams,
                        },
                        ...streamContractOptions
                      });
                      console.log("----> opResult: " + JSON.stringify(opResult));
                    }
                  }}>Withdraw from Streams</Button>
                </div>
              </Card>
            </Route>
            <Route path="/erc20balance">
              <ERC20Balance />
            </Route>
            <Route path="/onramp">
              <Ramper />
            </Route>
            <Route path="/erc20transfers">
              <ERC20Transfers />
            </Route>
            <Route path="/nftBalance">
              <NFTBalance />
            </Route>
            <Route path="/contract">
              <Contract />
            </Route>
            <Route path="/">
              <Redirect to="/quickstart" />
            </Route>
            <Route path="/ethereum-boilerplate">
              <Redirect to="/quickstart" />
            </Route>
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
          </Switch>
        </div>
      </Router>
      <Footer style={{ textAlign: "center" }}>
        <Text style={{ display: "block" }}>
          ⭐️ Please star this{" "}
          <a
            href="https://github.com/ethereum-boilerplate/ethereum-boilerplate/"
            target="_blank"
            rel="noopener noreferrer"
          >
            boilerplate
          </a>
          , every star makes us very happy!
        </Text>

        <Text style={{ display: "block" }}>
          🙋 You have questions? Ask them on the {""}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://forum.moralis.io/t/ethereum-boilerplate-questions/3951/29"
          >
            Moralis forum
          </a>
        </Text>

        <Text style={{ display: "block" }}>
          📖 Read more about{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://moralis.io?utm_source=boilerplatehosted&utm_medium=todo&utm_campaign=ethereum-boilerplat"
          >
            Moralis
          </a>
        </Text>
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  <div style={{ display: "flex" }}>
    <svg
      width="60"
      height="38"
      viewBox="0 0 50 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M43.6871 32.3986C43.5973 32.4884 43.53 32.5782 43.4402 32.6905C43.53 32.6007 43.5973 32.5109 43.6871 32.3986Z"
        fill="black"
      />
      <path
        d="M49.7037 14.3715C49.5241 6.2447 42.7891 -0.17592 34.6624 0.00367768C31.0031 0.0934765 27.4784 1.53026 24.8294 4.06708C22.113 1.46291 18.4986 0.00367768 14.727 0.00367768C6.71246 0.00367768 0.202047 6.49164 0 14.5511V14.6633C0 20.8146 2.24497 26.2698 4.26545 30.0189C5.11853 31.5904 6.08387 33.117 7.13901 34.5762C7.5431 35.115 7.8574 35.564 8.10435 35.8559L8.39619 36.2151L8.48599 36.3273L8.50844 36.3498L8.53089 36.3722C10.2146 38.3253 13.1555 38.5498 15.1087 36.8886C15.1311 36.8661 15.1536 36.8437 15.176 36.8212C17.1291 35.0701 17.3312 32.0843 15.625 30.1087L15.6026 30.0638L15.423 29.8618C15.2658 29.6597 15.0189 29.3455 14.727 28.9414C13.9188 27.8189 13.178 26.6515 12.5269 25.4392C10.8881 22.4309 9.42888 18.6145 9.42888 14.7531C9.49623 11.8347 11.9432 9.52236 14.8617 9.58971C17.7128 9.65705 19.9802 11.9694 20.0251 14.8205C20.0476 15.5389 20.2272 16.2348 20.5415 16.8859C21.4844 19.3104 24.2232 20.5227 26.6478 19.5798C28.4438 18.8839 29.6336 17.1553 29.6561 15.2246V14.596C29.7683 11.6775 32.2153 9.38766 35.1562 9.47746C37.94 9.56726 40.1625 11.8122 40.2748 14.596C40.2523 17.6941 39.2645 20.7472 38.1421 23.1718C37.6931 24.1371 37.1992 25.08 36.6379 25.978C36.4359 26.3147 36.2787 26.5617 36.1665 26.6964C36.1216 26.7862 36.0767 26.8311 36.0542 26.8535L36.0318 26.876L35.9869 26.9433C37.6033 24.9004 40.5442 24.5412 42.5871 26.1576C44.4953 27.6617 44.9443 30.3781 43.6198 32.4211L43.6422 32.4435V32.3986L43.6647 32.3762L43.732 32.2864C43.7769 32.1966 43.8667 32.1068 43.9565 31.9721C44.1361 31.7027 44.3606 31.3435 44.6525 30.8945C45.3933 29.6822 46.0668 28.4026 46.673 27.1229C48.1097 24.0249 49.6812 19.5349 49.6812 14.5286L49.7037 14.3715Z"
        fill="#041836"
      />
      <path
        d="M39.7135 25.1249C37.1094 25.1025 34.9991 27.2127 34.9766 29.8169C34.9542 32.4211 37.0645 34.5313 39.6686 34.5538C41.1503 34.5538 42.5647 33.8578 43.4626 32.6905C43.53 32.6007 43.5973 32.4884 43.6871 32.3986C45.1015 30.221 44.4729 27.3025 42.2953 25.9107C41.532 25.3943 40.634 25.1249 39.7135 25.1249Z"
        fill="#B7E803"
      />
    </svg>
  </div>
);

export default App;
