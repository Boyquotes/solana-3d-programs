import { extend } from '@react-three/fiber'
import { RigidBody } from "@react-three/rapier";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { Mesh } from 'three';
import { useThree, Canvas, useLoader } from "@react-three/fiber";
import * as React from 'react';
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import ShotCube from "./ShotCube";
import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as solanaWeb3 from '@solana/web3.js';
import BoxWithTexture from './BoxWithTexture';

import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { registerWalletAdapter, SOLANA_MAINNET_CHAIN } from '@solana/wallet-standard';
import { useWallets } from '@wallet-standard/react';
import { getWallets } from '@wallet-standard/app';

// import { BN, Idl, IdlAccounts, Program } from "@coral-xyz/anchor";
// import { BN, Program } from "@coral-xyz/anchor";
import BN from 'bn.js';
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "./idl.json";

const network = "https://api.devnet.solana.com"; // Use the appropriate network

const opts = {
    preflightCommitment: "processed",
  };


export default function SonarWatch() {


    // Program ID from the IDL metadata
    const [program, setProgram] = useState(null);
    // const programId = new PublicKey(idl.metadata.address);

    useEffect(() => {
        const loadProgram = async () => {
          const connection = new Connection(network, opts.preflightCommitment);
          
          // Assuming Phantom wallet extension
          const provider = new AnchorProvider(
            connection,
            window.solana, // Wallet instance
            opts
          );
    
          // Program ID from the IDL metadata
          const programId = new PublicKey('CAjif8p66ekjjRxwGeZxEUGr19Q34cCUSv8ShDFH1cYe');
          console.log("programId "+programId);
          
          // Load the program using the IDL
        //   const loadedProgram = new Program(idl, programId, provider);
        //   console.log("loadedProgram "+loadedProgram);
        //   setProgram(loadedProgram);
        };
    
        loadProgram();
      }, []);


    // console.log(programId);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const [nbToken, setNbToken] = useState(0);
    const [middleWallet, setMiddleWallet] = useState(0);
    const [dataSonarWatch, setDataSonarWatch] = useState();
    const [cubeNetworthText, setCubeNetworthText] = useState([]);
    const [cubeImgToken, setCubeImgToken] = useState([]);
    const [watchMe, setWatchMe] = useState(false);
    const [newTextWallet, setNewTextWallet] = useState([]);
    let [positionX, setPositionX] = useState(0);
    // AUDIO
    const listener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.Audio( listener );

    // SOLANA
    const [addressWalletSolana, setAddressWalletSolana] = useState();
    //   setAddressWalletSolana("GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S");
    const [balance, setBalance] = useState(null);

    const [walletsAvailable, setWalletsAvailable] = useState<string[]>([]);

    const provider = window.solana;
    console.log("provider solana");
    console.log(provider);
    console.log(solanaWeb3);
    console.log(window);


    // const connectWallet = async () => {
        // try {
        //     if (provider && provider.isPhantom) {
        //         // Connect to the wallet
        //         const response = await provider.connect();
        //         const publicKey = response.publicKey.toString();
        //         console.log("publicKey");
        //         console.log(publicKey);
        //         setAddressWalletSolana(publicKey);
        //     }
        // } catch (err) {
        //     console.error(err);
        // }

    // }
    // connectWallet();


    const playMoneySound = () => {
        audioLoader.load( 'audio/gling_coin.wav', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 2 );
            sound.play();
        });
    }

    function TextInput3D() {
    const meshRef = useRef<Mesh>(null);
    const [inputValue, setInputValue] = useState('');

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
        </mesh>
    );
    }

    useEffect(() => {
        const fetchDataSonar = async (address=null) => {
            setDataSonarWatch('');
            if(address && !addressWalletSolana){
                setAddressWalletSolana(address);
            }
            if(!address && !addressWalletSolana){
                setAddressWalletSolana("GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S");
            }
            if(addressWalletSolana != undefined){
                console.log(addressWalletSolana+" addressWalletSolana");
                const apiUrl = "https://portfolio-api.sonar.watch/v1/portfolio/fetch?useCache=false&address=" + addressWalletSolana + "&addressSystem=solana"
                try {
                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer alyraFqxeL6luVs9a3XQ8KG7n2H`,
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    // console.log("data sonar");
                    // console.log(data);
                    // console.log(data.fetcherReports);
                    // console.log(data.owner);
                    // console.log(data.tokenInfo);
                    if(data.tokenInfo.length == 0){
                        console.log("empty wallet");
                    }
                    // setDataSonarWatch(data);
                    setNbToken(0);
                    displayDataSonar(data);
                    setLoading(false);
                    setReload(false);
                } catch (error) {
                    setLoading(false);
                    console.error('Error fetching data:', error);
                }
            }
        };
        fetchDataSonar();
    }, [addressWalletSolana, reload]);

    const displayDataSonar = async (data) => {
            const newArray = [];
            setCubeImgToken(newArray);
            // debugger
            let i = 0;
            let z = 0
            let imgToken;
            console.log(data)
            
            data.elements.forEach(element => {
                console.log(element)
                if (element.platformId == "wallet-tokens") {
                    console.log("element.platformId"+element.platformId);
                    if (element.value > 0.0001) {
                        let netWorth = element.value.toFixed(2);
                        console.log('aquis' + netWorth);
                        let tokens = element.data.assets;
                        console.log(tokens);
                        let tokenWorth = 0;
                        tokens.forEach(tokenSW => {
                            setNbToken(nbToken+1);
                            // console.log(tokenSW.data.address);
                            // console.log(tokenSW.data.amount);
                            // console.log(tokenSW);
                            if(tokenSW.data.address == "11111111111111111111111111111111"){
                                imgToken = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
                            }
                            else if( tokenSW.data.address == "Fp4gjLpTsPqBN6xDGpDHwtnuEofjyiZKxxZxzvJnjxV6" || tokenSW.data.address == "xAURp5XmAG7772mfkSy6vRAjGK9JofYjc3dmQDWdVDP" || tokenSW.data.address == "DJafV9qemGp7mLMEn5wrfqaFwxsbLgUsGVS16zKRk9kc" || tokenSW.data.address == "94jMUy411XNUw1CnkFr2514fq6KRc49W3kAmrjJiuZLx"){
                                imgToken = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
                            }
                            else{
                                imgToken = "https://raw.githubusercontent.com/sonarwatch/token-lists/main/images/solana/"+tokenSW.data.address+".webp";
                            }
                            if (element.value > 1) {
                                netWorth = tokenSW.value.toFixed(2);
                            }
                            else{
                                netWorth = tokenSW.value.toFixed(4);
                            }
                            if (tokenSW.data.amount > 1) {
                                tokenWorth = tokenSW.data.amount.toFixed(2);
                            }
                            else{
                                tokenWorth = tokenSW.data.amount.toFixed(4);
                            }
                            console.log(imgToken);
                            const newImgToken = (
                                <Suspense fallback={null}>
                                    <RigidBody mass={0.2} position={[i, 2, z]}>
                                        <BoxWithTexture url={imgToken} />
                                    </RigidBody>
                                </Suspense>
                            )
                            // setCubeImgToken((prevMeshes) => [...prevMeshes, newImgToken])
                            console.log(i);
                            const newText = (
                                <Text
                                    rotation={[0, Math.PI, 0]}
                                    position={[i, 2, z]}
                                    color="green"
                                    fontSize={0.5}
                                    textAlign="center"
                                >
                                    {netWorth}$
                                </Text>);
                            const newTextTokenWorth = (
                                <Text
                                    rotation={[0, Math.PI, 0]}
                                    position={[i, 1.5, z]}
                                    color="green"
                                    fontSize={0.5}
                                    textAlign="center"
                                >
                                    {tokenWorth}
                                </Text>);
                            const newRigidB = (
                                <group position={[i, 0, 0]}>
                                    {newText}
                                    {newTextTokenWorth}
                                    {newImgToken}
                                </group>
                            )
                            setCubeImgToken((prevMeshes) => [...prevMeshes, newRigidB]);
                            setCubeNetworthText((prevMeshes) => [...prevMeshes, newText]);
                            i = i+3;
                            if(i<10){
                                playMoneySound();
                            }
                            if(i == 10 || i == 20 || i == 30 || i == 40 || i == 50){
                                i = 0;
                                z += 10;
                                playMoneySound();
                            }
                        });
                    }
                    else{
                        console.log("wallet empty or poor wallet")
                    }
                }
            });
    };


    useEffect(() => {
        const getWalletSolana = async () => {
            // const walletsStd = useWallets();
            const walletsStd = getWallets();
            console.log("walletstd "+walletsStd);
            console.log("walletstd "+JSON.stringify(walletsStd, null, 2));
            // return (
            //     <ul>
            //         {walletsStd.map((wallet, index) => (
            //             <li key={index}>{wallet.name}</li>
            //         ))}
            //     </ul>
            // );

            // {walletsStd.entries(user).map(([key, value]) => (
            //     <li key={key}>
            //       <strong>{key}:</strong> {value}
            //     </li>
            //   ))}


            // {walletsStd.map((wallet, index) => (
            //     console.log("walstd "+wallet.name)
            // ))}
        }
        getWalletSolana();
    }, []);
    // useEffect(() => {
    //     console.log("data reload")
    //     displayDataSonar();
    // }, [dataSonarWatch]);

    useEffect(() => {
        console.log("laaaa");
        if (window.solflare) {
            console.log("walletttsf "+walletsAvailable);
            console.log("Le wallet Solflare est installé.");
            setWalletsAvailable((walletsAvailable) => [...walletsAvailable, "Solflare"]);
        } else {
            console.log("Le wallet Solflare n'est pas installé.");
        }
        if (window.xnft) {
            console.log("walletttsbb "+walletsAvailable);
            console.log("Le wallet Backpack est installé.");
            setWalletsAvailable((walletsAvailable) => [...walletsAvailable, "Backpack"]);
            console.log("walletttsbb2  "+walletsAvailable);
        } else {
            console.log("Le wallet Backpack n'est pas installé.");
        }

        if (provider && provider.isPhantom) {
            console.log("Le wallet Phantom est installé.");
            setWalletsAvailable((walletsAvailable) => [...walletsAvailable, "Phantom"]);
        } else {
            console.log("Le wallet Phantom n'est pas installé.");
        }
        // let test= "tere";
        // setWalletsAvailable([...walletsAvailable, "terre"]);
    }, [window]);
    console.log("wallettts "+walletsAvailable);
    console.log(walletsAvailable);

    const addValueToArray = (value) => {
        setNewTextWallet((prevValues) => [...prevValues, value]);
        setIsUpdated(true);
      };

    const [isUpdated, setIsUpdated] = useState(false);
    useEffect(() => {
        if (isUpdated) {
          console.log('Tableau mis à jour:', walletsAvailable);
          // Exécuter une autre opération après la mise à jour
          // Par exemple, ajouter une autre valeur
        //   addAnotherValueAfterUpdate();
          setIsUpdated(false);
        }
      }, [walletsAvailable, isUpdated]);


    useEffect(() => {
        const getWalletSolana = async () => {
            let newTextWallet;
            let wallets=String[''];
            try {
                console.log("provider wallettts");
                console.log(provider);
                console.log("wallettts "+walletsAvailable.length);
                console.log(walletsAvailable.length);
                if (walletsAvailable.length > 0) {
                    // Connect to the wallet
                    // const response = await provider.connect();
                    // const publicKey = response.publicKey.toString();
                    console.log("publicKey wallettts");
                    // console.log(publicKey);
                    // setAddressWalletSolana(publicKey);

                    const responseBackpackConnect = await window.backpack.connect();
                    // const responseSolflareConnect = await window.solflare.connect();

                    // Fetch the balance
                    // Convert Base58 string to PublicKey object
                    // const publicKeyForBalance = new PublicKey(publicKey)
                    // const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
                    // const balance = await connection.getBalance(publicKeyForBalance);
                    // console.log(balance);
                    // // Convert the balance from lamports to SOL (1 SOL = 1,000,000,000 lamports)
                    // const balanceInSOL = balance / LAMPORTS_PER_SOL;
                    // console.log(`Balance: ${balanceInSOL} SOL`);
                    let y = 4;
                    walletsAvailable.map((item, i) => {
                        console.log("item "+item)
                        newTextWallet = (<Text
                            rotation={[0, Math.PI, 0]}
                            position={[0, y, 0]}
                            color="black"
                            fontSize={0.5}
                            >View your {item} portfolio
                            </Text>);
                            y += 4;
                            addValueToArray(newTextWallet);
                    //     setNewTextWallet((walletsAvailable) => [...walletsAvailable, newTextWallet]);
                    })
                    
                    // newTextWallet = (<Text
                    //     rotation={[0, Math.PI, 0]}
                    //     position={[0, y, 0]}
                    //     color="black"
                    //     fontSize={0.5}
                    //     >View your back portfolio
                    //     </Text>)
                    // addValueToArray(newTextWallet);
                    // // setNewTextWallet((walletsAvailable) => [...walletsAvailable, newTextWallet]);
                    // newTextWallet = (<Text
                    //     rotation={[0, Math.PI, 0]}
                    //     position={[0, y+2, 0]}
                    //     color="black"
                    //     fontSize={0.5}
                    //     >View your sol portfolio
                    //     </Text>)
                    // addValueToArray(newTextWallet);
                    // setNewTextWallet((walletsAvailable) => [...walletsAvailable, newTextWallet]);
                }
                // else{
                //     newTextWallet = (<Text
                //         rotation={[0, Math.PI, 0]}
                //         position={[0, 4, 0]}
                //         color="black"
                //         fontSize={0.5}
                //         onClick={checkYourAddress}
                //         >You don't have a wallet!
                //         </Text>);
                //         setNewTextWallet((prevMeshes) => [...prevMeshes, newTextWallet]);
                // }
                setWatchMe(false);
                setLoading(false);
            } catch (err) {
                console.error(err);
            }
        }

        // audioLoader.load( '/solana-3d-dashboard/audio/gling_coin.wav', function( buffer ) {
        //     sound.setBuffer( buffer );
        //     sound.setLoop( true );
        //     sound.setVolume( 2 );
        //     sound.play();
        // });
        getWalletSolana();
        // fetchDataSonar();
    }, [walletsAvailable]);


    // audioLoader.load( 'gling_coin.wav', function( buffer ) {
    //     sound.setBuffer( buffer );
    //     sound.setLoop( true );
    //     sound.setVolume( 2 );
    //     sound.play();
    // });

  const checkYourAddress = async() => {
    setCubeImgToken([]);
    if(loading){
        console.log("already onDemand");
    }
    else{
        if (provider && provider.isPhantom) {
            const response = await provider.connect();
            const publicKey = response.publicKey.toString();
            console.log("publicKey");
            console.log(publicKey);
            setAddressWalletSolana(publicKey);
        }
        setWatchMe(true);
        setLoading(true);
        setReload(true);
        // fetchDataSonar();
    }
  };

  const checkBalancesAddressTest = () => {
    setCubeImgToken([]);
    if(loading){
        console.log("already onDemand");
    }
    else{
        setAddressWalletSolana("GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S")
        setLoading(true);
        setReload(true);
        // fetchDataSonar("GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S");
    }
  };

    const checkBalancesAddress  = () => {
        setCubeImgToken([]);
        if(loading){
            console.log("already onDemand");
        }
        else{
            setAddressWalletSolana("MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2")
            setLoading(true);
            setReload(true);
            // fetchDataSonar("MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2");
        }
    };
    const checkBalancesAddressWhale2  = () => {
        setCubeImgToken([]);
        if(loading){
            console.log("already onDemand");
        }
        else{
            setAddressWalletSolana("EJRJswH9LyjhAfBWwPBvat1LQtrJYK4sVUzsea889cQt")
            setLoading(true);
            setReload(true);
        }
    };
    const checkBalancesAddressWhale3  = () => {
        setCubeImgToken([]);
        if(loading){
            console.log("already onDemand");
        }
        else{
            setAddressWalletSolana("GitYucwpNcg6Dx1Y15UQ9TQn8LZMX1uuqQNn8rXxEWNC")
            setLoading(true);
            setReload(true);
        }
    };
 console.log("address solana"+addressWalletSolana);
 console.log("cubeImgToken"+cubeImgToken.length);
// setMiddleWallet(0);
let lengthWallet, calculMiddleWallet = 0;
console.log("tokens.length "+cubeImgToken.length);
if(cubeImgToken.length > 10){
    let nbLine = Math.round(cubeImgToken.length / 10);
    console.log("nbLine"+nbLine);
    lengthWallet = (10 * 2) + ((10-1) *3);
}
else{
    lengthWallet = ((cubeImgToken.length) * 2) + ((cubeImgToken.length-1) *3);
}

console.log("length wallet "+lengthWallet);
calculMiddleWallet = lengthWallet / 2;
console.log("middleWallet wallet "+newTextWallet);
// setMiddleWallet(calculMiddleWallet);
 return (
        <>
            <group position={[0, 0, 10]}>
                {newTextWallet.map((item, i, arr) => {
                    console.log("item "+JSON.stringify(item, null, 2));
                        return (
                            <>
                                {item}
                            </>
                    )})
                }
                <Text
                rotation={[0, Math.PI, 0]}
                position={[-11, 5, 0]}
                color="black"
                fontSize={0.5}
                onClick={checkBalancesAddress}
                >View whale portfolio
                </Text>
                <Text
                rotation={[0, Math.PI, 0]}
                position={[-11, 4, 0]}
                color="black"
                fontSize={0.5}
                onClick={checkBalancesAddressWhale2}
                >View whale 2 portfolio
                </Text>
                <Text
                rotation={[0, Math.PI, 0]}
                position={[-11, 3, 0]}
                color="black"
                fontSize={0.5}
                onClick={checkBalancesAddressWhale3}
                >View whale 3 portfolio
                </Text>
                <Text
                rotation={[0, Math.PI, 0]}
                position={[3.5, 5, 0]}
                color="black"
                fontSize={0.5}
                onClick={checkBalancesAddressTest}
                >View test wallet
                </Text>
            </group>
            <group position={[-calculMiddleWallet, 0, 10]}>
                {cubeImgToken.map((item, i, arr) => {
                // if (arr.length - 1 === i) {
                    // console.log(item)
                    return (
                    <>
                        {item}
                    </>
                    )})
                }
            </group>
        </>
    );


}