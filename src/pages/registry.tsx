import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { parseEther } from 'ethers/lib/utils'
import Image from 'next/image'
import axios from 'axios'
// import { EvmNft } from '@fungyproof/nft-resolver'
import { useEnrichmentContract } from '../hooks/useContract'
import { useSingleCallResult } from '../state/multicall/hooks'
import Typography from '../components/Typography'

export default function Dashboard() {
  const [nft, setNft] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [error, setError] = useState(null)
  const [address, setOwnerAddress] = useState('')
  const [tokenId, setOwnerTokenId] = useState(null)
  const [enrichmentId, setEnrichmentId] = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const [enrichTokenId, setEnrichTokenId] = useState(1)

  // get enrichment
  const enrichment = useEnrichmentContract('0x701715E5a767a9BD0C29Ef3a308F623ECB11Bc53', true)
  const tokenURI = useSingleCallResult(enrichment, 'tokenURI', [enrichTokenId])
  const ownerNFT = useSingleCallResult(enrichment, 'ownerOf', [enrichTokenId])
  const enrichmentBuyer = useSingleCallResult(enrichment, 'buyerOf', [enrichTokenId])

  const [addr, id] = ownerNFT?.result ? ownerNFT?.result?.[0] : []
  const uri = tokenURI?.result ? tokenURI?.result?.[0] : ''
  const buyer = enrichmentBuyer?.result ? enrichmentBuyer?.result?.[0] : ''

  const onEnrich = async () => {
    setSubmitting(true)
    try {
      const enrichmentTx = await enrichment.enrich(address, tokenId, enrichmentId, {
        value: parseEther('1'),
      })
      console.log(enrichmentTx)
      setEnrichTokenId(enrichmentId)
    } catch (err) {
      console.log(err)
      setError(err.data?.message?.replace('VM Exception while processing transaction: revert ', '') || err.message)
    }
  }

  const onDismissError = async () => {
    setError(null)
  }

  // useEffect(() => {
  //   if (nft) return
  //   const token = new EvmNft({
  //     tokenId: 9460,
  //     contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
  //     infuraKey: '8629530900274ca9bd4bc62e37f65052',
  //   })
  //   const sub = token.subscribe(
  //     () => null,
  //     setError,
  //     () => {
  //       axios.get(token.uri).then((res) => {
  //         setMetadata(res.data)
  //       })
  //       setNft(token)
  //     }
  //   )
  // }, [nft])

  return (
    <>
      <Head>
        <title>Registry | FungyProof</title>
        <meta name="description" content="FungyProof" />
      </Head>

      <div className="w-full max-w-2xl p-4 mb-3 rounded">
        {error && (
          <div
            className="animate-pulse bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <span className="block sm:inline">{error}.</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onDismissError}>
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}

        <pre>Enrichment Contract: 0x3F461e85e2e4868375D39AA8E0b815d11FC88de3</pre>
        <pre>
          Owner: {addr}_{id?.toString()}
          <br />
          Enrichment URI: {uri}
          <br />
          Buyer: {buyer}
        </pre>
        {uri && <img src={uri} className="w-40 mt-4" />}
        <hr className="mt-2" />

        <Typography component="h2" variant="h3" className="mt-6">
          Enrich Token
        </Typography>
        <input
          type="text"
          name="address"
          id="address"
          className="border focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-sm p-2 mt-2"
          placeholder="token address"
          onChange={(event) => setOwnerAddress(event.target.value)}
        />
        <input
          type="text"
          name="tokenID"
          id="tokenID"
          className="border focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-sm p-2 mt-2"
          placeholder="token id"
          onChange={(event) => setOwnerTokenId(event.target.value)}
        />
        <input
          type="text"
          name="enrichmentId"
          id="enrichmentId"
          className="border focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-sm p-2 mt-2"
          placeholder="enrichment id"
          onChange={(event) => setEnrichmentId(event.target.value)}
        />
        <button className="bg-black text-white rounded p-2 mt-2" onClick={onEnrich}>
          Enrich
        </button>
      </div>

      {/* <div className="w-full max-w-2xl p-4 mb-3 rounded">
        Registry
        <pre>{JSON.stringify(nft, null, 2)}</pre>
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
        <img src={metadata?.image} />
        {error?.message}
      </div> */}
    </>
  )
}
