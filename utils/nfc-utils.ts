/**
 * NFC Utilities for MyKad Reading and Smart Contract Integration
 * This file handles mock data and future smart contract interactions
 */

export interface MyKadData {
  cardNumber: string;
  name: string;
  sex: string;
  birthDate: string;
  address: string;
  city: string;
  postcode: string;
  state: string;
  nationality: string;
  religion: string;
  cardExpiry: string;
  cardStatus: string;
  uuid?: string; // NFC UID from actual card read
  detectedAt?: string;
}

export interface SmartContractPayload {
  cardNumber: string;
  name: string;
  birthDate: string;
  address: string;
  timestamp: string;
  signature?: string; // Will be added after smart contract integration
}

/**
 * Parse MyKad data into Smart Contract format
 * @param myKadData - Raw MyKad data from NFC reader
 * @returns Formatted payload for smart contract
 */
export const prepareSmartContractPayload = (
  myKadData: MyKadData
): SmartContractPayload => {
  return {
    cardNumber: myKadData.cardNumber,
    name: myKadData.name,
    birthDate: myKadData.birthDate,
    address: myKadData.address,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validate MyKad data format
 * @param data - MyKad data to validate
 * @returns true if valid, false otherwise
 */
export const validateMyKadData = (data: any): data is MyKadData => {
  return (
    data &&
    typeof data.cardNumber === "string" &&
    typeof data.name === "string" &&
    typeof data.birthDate === "string" &&
    data.cardNumber.match(/^\d{6}-\d{2}-\d{4}$/) // Format: XXXXXX-XX-XXXX
  );
};

/**
 * Future: Send MyKad data to smart contract
 * @param payload - Smart contract payload
 * @returns Transaction hash
 */
export const submitToSmartContract = async (
  payload: SmartContractPayload
): Promise<string> => {
  // TODO: Implement smart contract integration
  // This will use ethers.js or web3.js to submit to blockchain
  console.log("Submitting to smart contract:", payload);
  throw new Error("Smart contract integration not yet implemented");
};

/**
 * Mock: Generate random MyKad data for testing
 * @returns Random MyKad data
 */
export const generateMockMyKadData = (): MyKadData => {
  const cardNumber = `${String(Math.floor(Math.random() * 900000) + 100000)}-${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const names = ["AHMAD IBRAHIM", "SITI NURHALIZA", "MUHAMMAD AZHAR", "NURUL AISYAH"];
  const cities = ["KUALA LUMPUR", "SHAH ALAM", "SELANGOR", "PETALING JAYA"];
  const states = ["WILAYAH PERSEKUTUAN", "SELANGOR", "JOHOR", "PENANG"];

  return {
    cardNumber,
    name: names[Math.floor(Math.random() * names.length)],
    sex: Math.random() > 0.5 ? "MALE" : "FEMALE",
    birthDate: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 40) + 1960)}`,
    address: "NO 123, JALAN MERDEKA",
    city: cities[Math.floor(Math.random() * cities.length)],
    postcode: String(Math.floor(Math.random() * 90000) + 50000),
    state: states[Math.floor(Math.random() * states.length)],
    nationality: "WARGANEGARA",
    religion: "ISLAM",
    cardExpiry: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${2030 + Math.floor(Math.random() * 10)}`,
    cardStatus: "ACTIVE",
  };
};
