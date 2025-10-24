"use client"

import InputField from "@/components/ui/InputField";
import { useState, useEffect } from "react";
import { chainsToTSender, tsenderAbi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract, useReadContracts } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { erc20Abi } from "viem";
import { useMemo } from "react";
import { calculateTotal, formatTokenAmount } from "@/utils";

interface StoredFormData {
    tokenAddress: string;
    recipients: string;
    amounts: string;
}

const STORAGE_KEY = 'airdrop-form-data';

export default function AirDropForm() {

    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => (calculateTotal(amounts)), [amounts]);
    const { data: hash, isPending, writeContractAsync } = useWriteContract();
    const { data: tokenData } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address as `0x${string}`],
            },
        ],
    })
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true)

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain");
            return 0;
        }
        console.log("tSenderAddress:", tSenderAddress);
        // read from the chain to see if we have approved enough token
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address as `0x${string}`, tSenderAddress as `0x${string}`],
        })
        //token.allowace(account,tsender)
        return Number(response);

    }

    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsedData: StoredFormData = JSON.parse(savedData);
                setTokenAddress(parsedData.tokenAddress || "");
                setRecipients(parsedData.recipients || "");
                setAmounts(parsedData.amounts || "");
            } catch (error) {
                console.error("Error loading saved form data:", error);
                // Clear corrupted data
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    // Save to localStorage whenever form inputs change
    useEffect(() => {
        const formData: StoredFormData = {
            tokenAddress,
            recipients,
            amounts
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [tokenAddress, recipients, amounts]);


    async function handleSubmit() {
        //1a. If already approved, move to step 2
        //1b. Approve our tsender contract to send our token 
        //2. Call the airdrop function on the tsender contract
        //3. Wait for the trasnsaction to be mined
        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        console.log("tSenderAddress:", tSenderAddress);
        const approvedAmount = await getApprovedAmount(tSenderAddress);

        if (approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)]
            })
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            })
            console.log("Approval successful:", approvalReceipt)

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })

        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }
    }

    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress')
        const savedRecipients = localStorage.getItem('recipients')
        const savedAmounts = localStorage.getItem('amounts')

        if (savedTokenAddress) setTokenAddress(savedTokenAddress)
        if (savedRecipients) setRecipients(savedRecipients)
        if (savedAmounts) setAmounts(savedAmounts)
    }, [])

    useEffect(() => {
        localStorage.setItem('tokenAddress', tokenAddress)
    }, [tokenAddress])

    useEffect(() => {
        localStorage.setItem('recipients', recipients)
    }, [recipients])

    useEffect(() => {
        localStorage.setItem('amounts', amounts)
    }, [amounts])




    return (
        <div>
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="0x12314,0x12342342"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />

            <InputField
                label="Amount"
                placeholder="100, 200, 300.."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large={true}
            />

            <div className="bg-white border border-zinc-300 rounded-lg p-4 padding-4 mt-4">
                <h3 className="text-sm font-medium text-zinc-900 mb-3">Transaction Details</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Token Name:</span>
                        <span className="font-mono text-zinc-900">
                            {tokenData?.[1]?.result as string}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Amount (wei):</span>
                        <span className="font-mono text-zinc-900">{total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Amount (tokens):</span>
                        <span className="font-mono text-zinc-900">
                            {formatTokenAmount(total, tokenData?.[0]?.result as number)}
                        </span>
                    </div>
                </div>
            </div>


            <button
                onClick={handleSubmit}
                disabled={isPending}
                className={`px-10 py-3 flex items-center justify-center gap-2 padding-2 mt-4
                    ${isPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} 
                    text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                    transition-all duration-200 ease-in-out transform 
                    ${!isPending && "hover:-translate-y-0.5"} 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
                {isPending ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                        </svg>
                        Sending...
                    </>
                ) : (
                    "Send Tokens"
                )}
            </button>
        </div>

    )


}