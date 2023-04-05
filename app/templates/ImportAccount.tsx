import React from 'react';
import { RadioGroup, Button, Loader, Layout, Icon } from 'communi-design-system';
import { isConnected } from '@stellar/freighter-api';
import { useFetcher } from '@remix-run/react';
import { WalletClient } from '~/actions/WalletClient';
import { SignClient } from '@walletconnect/sign-client';
import { isBrowser } from '~/utils/misc.client';
import { QRCode } from 'react-qrcode-logo';

enum WalletConnectChains {
  PUBLIC = 'stellar:pubnet',
  TESTNET = 'stellar:testnet',
}

enum WalletConnectMethods {
  SIGN = 'stellar_signXDR',
  SIGN_AND_SUBMIT = 'stellar_signAndSubmitXDR',
}

const WalletConnect = ({ connectWallet }: any) => {
  const [ url, setUrl ] = React.useState('');
  React.useEffect(() => {
    if (isBrowser) {
      SignClient.init({
        projectId: "dacff933c2c1886c24cbdf69b5bbf21c",
        metadata: {
          name: "izar-network",
          url: "my-auth-dapp.com",
          description: "A dapp using WalletConnect SignClient",
          icons: ["https://my-auth-dapp.com/icons/logo.png"],
        },
      }).then(async (client: any) => {
        const { uri, approval } = await client.connect({
          requiredNamespaces: {
            stellar: {
              methods:[WalletConnectMethods.SIGN],
              chains: [WalletConnectChains.PUBLIC],
              events: [],
            },
          },
        })
        if (uri) setUrl(uri)
        approval().then(async (session: any) => {
          const allNamespaceAccounts = Object.values(session.namespaces)
          .map((namespace: any) => namespace.accounts)
          .flat();
          const allNamespaceChains = Object.keys(session.namespaces);
          const publicKey = allNamespaceAccounts[0].replace("stellar:pubnet:", '')
          await connectWallet({ public_key: publicKey, provider: 'wallet_connect' })
        })
        .catch((error: any) => {
          console.log('APPROVAL ERROR', error)
        });
      })
    }
    
  }, [])

  return !url ? <Loader /> : <>
    <div className="flex flex-col items-center mb-[40px]">
      <div>
        <QRCode
          value={url}
          logoImage="https://imagedelivery.net/uDbEDRBQqhBXrrfuCRrATQ/eee714c7-b85b-42cf-23f7-d986b99c1b00/public"
          logoHeight={48}
          logoWidth={48}
          eyeRadius={8}
          size={256}
          bgColor="#C8D1E6"
          fgColor="#03050B"
          removeQrCodeBehindLogo={true}
          qrStyle="dots"
        />
      </div>
    </div>
  </>
};


const Albedo = ({ connectWallet }: any) => {
  const wc = new WalletClient('albedo', 'TESTNET')
  wc.getPublicKey().then(async (account: any) => { await connectWallet({ public_key: account.pubkey, provider: 'albedo' }) })
  return <Loader />;
};

const Freighter = ({ connectWallet }: any) => {
  React.useEffect(() => {
    if (isConnected()) {
      const wc = new WalletClient('freighter', 'TESTNET')
      wc.getPublicKey().then( async (value: any) => {
        const public_key = await value()
        await connectWallet({ public_key, provider: 'freighter' })  
      })
    }
  }, []);
  return <Loader />;
};

const Rabet = ({ connectWallet }: any) => {
  const wc = new WalletClient('rabet', 'TESTNET')
  wc.getPublicKey().then(async ({ publicKey }: any) => await connectWallet({ public_key: publicKey, provider: 'rabet' }))
  return <Loader />;
};

const options = [
  {
    name: 'Wallet Connect',
    icon: 'walletConnect',
  },
  {
    name: 'Albedo',
    icon: 'albedo',
  },
  {
    name: 'Rabet',
    icon: 'rabet',
  },
  {
    name: 'Freighter',
    icon: 'freighter',
  },
];

type ImportAccountProps = {};

const walletAssert = (view: any, connectWallet: any) => {
  switch (view) {
    case 'Rabet':
      return <Rabet connectWallet={connectWallet} />;
    case 'Freighter':
      return <Freighter connectWallet={connectWallet} />;
    case 'Albedo':
      return <Albedo connectWallet={connectWallet} />;
    case 'Wallet Connect':
      return <WalletConnect connectWallet={connectWallet} />;
    default:
      return <></>;
  }
};

// Move to DS Headings.
const IconHeading = ({ text, icon }: any) => {
  return <div className="flex flex-row">
    <Icon name={icon} size="large" />
    <div className="text-h3-small-bold" style={{paddingLeft: '12px'}}>{text}</div>
  </div>
}

export const ImportAccount: React.FC<ImportAccountProps> = ({}) => {
  const [view, setView] = React.useState('');
  const [selected, Select] = React.useState(options[0]);
  const [payload, setPayload] = React.useState({ public_key: '', provider: ''});
  const fetcher = useFetcher();
  // const { closeModal } = useModal();

  React.useEffect(() => {
    const { public_key, provider } = payload;
    if (public_key && fetcher.type === 'init') {
      fetcher.submit(
        { public_key, provider },
        { method: 'post', action: '/auth_wallet' }
      );
    }
    if (fetcher.type === 'done') {
      console.log('closing window ...', fetcher.data)
      // closeModal();
    }
  }, [payload.public_key, fetcher]);

  const button = {
    text: `${view === '' ? `Continue with ${selected.name}` : 'Cancel'}`,
    variant: `${view === '' ? 'primary' : 'warning'}`,
  };

  return (
    <div>

<div
      style={{
        backgroundImage: "url('https://imagedelivery.net/uDbEDRBQqhBXrrfuCRrATQ/cb3fca94-6358-47a3-6150-a10d0d7e1100/public')",
        backgroundSize: 'cover',
        height: '100vh',
        width: '100%'
      }}
    >
        <Layout
          variant="large"
        >
          <div
            className="flex items-center h-screen"
          >
            <div
              className="bg-neutral-300 rounded-[20px] p-[40px] w-full "
            >
              <div className="flex flex-col">
                <div className="flex flex-row w-full">
                  <div className="flex-1">
                    <IconHeading text="Wallet Connect" icon="walletConnect" />
                    <div>Scan the QR with your phone from a wallet app</div>
                    <div>
                      <WalletConnect connectWallet={setPayload} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <IconHeading text="Extensions" icon="extensions" />
                  </div>
                </div>
                <div>
                  <div>By Continue you accept our term of conditioons and our privacy policy</div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
    </div>
     {/* <div className="flex flex-col space-y-4">
       <button onClick={() => console.log('hello')}>Clickme</button>
       {payload.public_key === '' ? (
         <>
           <div>
             <div className="text-subheading-bold text-neutral-800">Wallets</div>

             <div className="text-paragraph-medium-medium text-neutral-800">Choose your favorite wallet to connect with.</div>
           </div>
           <div>
             {view === '' ? (
               <RadioGroup options={options} setValue={Select} />
             ) : (
               walletAssert(view, setPayload)
             )}
             <Button
               text={button.text}
               variant={button.variant}
               onClick={() => setView(view === '' ? selected.name : '')}
               customCss="w-full"
             />
           </div>
           <div className="text-center text-caption-medium text-neutral-600">We use stellar base wallets, learn more about creating your first stellar account.</div>
         </>
       ) : 
         <>
           <div className="text-center">
             <div className="text-subheading-bold text-neutral-800">Connecting ...</div>
             <div className="text-paragraph-medium-medium text-neutral-800">You will be redirected soon.</div>
           </div>
         </>
       }
     </div> */}

    </div>
  );
};
