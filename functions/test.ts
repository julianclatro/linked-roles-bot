import { StellarWalletsKit, WalletNetwork, WalletType } from 'stellar-wallets-kit';
import { parse } from 'cookie';
interface Env {
  SESSION_STORAGE: KVNamespace;
  authsigningkey: any;
  DB: D1Database;
}
  export const onRequestGet: PagesFunction<Env> = async (context) => {
    const cookies = context.request.headers.get("Cookie")
    const cookieHeader = parse(cookies);
    console.log(cookieHeader)
    const ourURL = new URL(context.request.url).origin
    const posturl = new URL('/auth', ourURL).toString();
    // make sure the state parameter exists
    const { clientState, discord_user_id } = cookieHeader;
    console.log(discord_user_id)
     console.log("It's in the test")
      const html = `
      <!DOCTYPE html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-freighter-api/1.3.1/index.min.js"></script>
      </head>
      <script>
        
      
        function getPubKey(discord_user_id) {
          console.log('discord_user_id', discord_user_id)

          window.freighterApi.getPublicKey().then(
            
            (public_key) => {
            fetchurl=(\"${posturl}\"+"?userid="+ discord_user_id + "&account=" + public_key);
            //\`${posturl}\`
            //    clientauth(public_key);
            fetch(fetchurl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            })
            .then(response => response.json())
            .then((response) => {
                console.log(response.Transaction);
                console.log(response.Network_Passphrase);
                console.log(public_key);
                console.log("the type of response.transaction is:", typeof(response.Transaction));
                console.log("the type of response.network_passphrase is:", typeof(response.Network_Passphrase));
                const signedXDR = window.freighterApi.signTransaction(JSON.stringify(response.Transaction), "TESTNET", public_key);
                
               } ).then((signedXDR) =>{
                fetch(fetchurl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({"Transaction": signedXDR, "NETWORK_PASSPHRASE": "Test SDF Network ; September 2015", "discord_user_id": discord_user_id}),
                }).then((tokens)=>{
                  console.log(tokens)
                })})
               }
            
        )
        }
        /*

       function getPubKey(input){
        console.log(input)
        window.freighterApi.getPublicKey(input).then(response => {console.log(response)})
       }*/
      </script>
      <button onclick="getPubKey(${discord_user_id})">Connect with Freighter</button>
      
      `;

      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }

    function getChallengeURL(discord_user_id, stellaraccount, context, state) {
        //const { codeVerifier, codeChallenge } = generateCodeVerifier();
        //const state = crypto.randomBytes(20).toString('hex');
      
        const url = new URL('http://127.0.0.1:8788/auth');
        url.searchParams.set('userid', discord_user_id);
        url.searchParams.set('account', stellaraccount);
        url.searchParams.set('redirect_uri', "http://127.0.0.1:8788");  //probably the user page
        //url.searchParams.set('code_challenge', codeChallenge);
        //url.searchParams.set('code_challenge_method', 'S256');
        url.searchParams.set('state', state);
        //url.searchParams.set('response_type', 'code');
        //url.searchParams.set(
      //    'scope',
          //'user'
        //);
        url.searchParams.set('prompt', 'consent');
        return { state, url: url.toString() };
      }