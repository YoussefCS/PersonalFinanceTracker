import { LoadingOverlay, DataTable } from '@saas-ui/react'
import { Container, Center, Text, Box, Button, Image, VStack, HStack, Divider, Link } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { AttachmentIcon } from '@chakra-ui/icons'
import { ExpensesContext } from "../context/ExpensesProvider";
import { useContext } from 'react';
import { useNavigate} from 'react-router-dom';
import { Link as RouterLink } from "react-router-dom";

function ReadWords() {
    const { updateTotalExpenses } = useContext(ExpensesContext);
    const [res, setRes] = useState();
    const [file, setFile] = useState();
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleUploadFile = (evt) => {
        setFile(
            evt.target.files[0],
        )
    }
    const submitPhoto = async () => {
        if (!file) {
            alert("Please upload a receipt image.");
            return;
        }
    
        setIsUploading(true);
    
        const data = new FormData();
        data.append('file', file);
    
        const url = "https://api.taggun.io/api/receipt/v1/verbose/file";
    
        try {
            // Fetch the current user's ID
            const userResponse = await axios.get("http://localhost:5000/api/user", {
                withCredentials: true,
            });
    
            const user_id = userResponse.data.id;
    
            if (!user_id) {
                alert("User ID not found. Please log in again.");
                return;
            }
    
            const taggunResponse = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'apikey': import.meta.env.VITE_TAGGUN_API_KEY,
                },
            });
    
            console.log("Taggun API Response:", taggunResponse);
    
            // Extract relevant data from the API response
            const receiptData = {
                user_id, // Add user_id to the payload
                title: taggunResponse.data.merchantName?.data || "Unknown Merchant",
                date: taggunResponse.data.date?.data || new Date().toISOString(),
                amount: parseFloat(taggunResponse.data.paidAmount?.data) || 0,
                type: "Expense", // Set to Expense by default
            };
    
            if (!receiptData.amount || !receiptData.title || !receiptData.user_id) {
                console.error("Invalid receipt data:", receiptData);
                alert("Invalid receipt data. Please check the receipt and try again.");
                return;
            }
    
            console.log("Receipt Data to Store:", receiptData);
    
            // Save the extracted data to the summary table via backend
            const backendResponse = await axios.post(
                "http://localhost:5000/api/summary/receipt",
                receiptData,
                {
                    withCredentials: true,
                }
            );
    
            console.log("Backend Response:", backendResponse);
    
            // Update the total expenses dynamically
            if (receiptData.type === "Expense") {
                console.log("Updating total expenses with receipt:", receiptData.amount);
                updateTotalExpenses(receiptData.amount); // Dynamically update totalExpenses
            }
    
            alert("Receipt data saved successfully!");
            setRes(taggunResponse); // Store the full response for display if needed
            navigate("/summary");
        } catch (error) {
            console.error("Error analyzing receipt or saving data:", error.response?.data || error.message);
            alert("Failed to analyze receipt or save data. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    
    
    return (
        <Container 
            width="100vw"
            h="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bg="gray.50"
        >
            <Box position="absolute" top={4} left={4}>
                <Link as={RouterLink} to="/home">
                    <Image
                        src="../../public/logoIcon.png" // Replace with the path to your icon
                        alt="App Icon"
                        boxSize="40px" // Adjust size as needed
                    />
                </Link>
            </Box>


            <Box height="100vh" mt="30vh">
                <Box textAlign="center">
                <Center>
                    <Image
                        boxSize='45px'
                        objectFit='cover'
                        src='../../public/logoIcon.png'
                    />
                </Center>
                <Text fontSize="xl" fontWeight="medium">Welcome to our scanner, where we will save the data from your receipt into our database.</Text>
                <Text fontSize="md" color="gray.500">Upload an image of a store receipt below to see results</Text>
        
                <VStack mt={16}>
                    {file ? <Box><Text>{file.name}</Text></Box> : <VStack spacing={6} ml={90}><Box>
                    <label htmlFor="file-upload">
                        <AttachmentIcon />
                    </label>
                    <input id="file-upload" type="file" onChange={handleUploadFile} />
                    </Box>
                </VStack>}
        
                    {isUploading ? <LoadingOverlay thickness="2px" /> : <Button size="md" colorScheme="primary" onClick={submitPhoto}>
                        Upload photo
                    </Button>
        
                    }
                </VStack>
                </Box>
        
                {res && <Box>
                <Box mt={10}>
                    <Center>
                    <Text fontWeight="medium">Successfully analyzed receipt</Text></Center>
        
                    <Text fontWeight="medium">Details</Text>
                    <Divider mb={4} />
                    <HStack>
                    <Text width={100}>
                        Receipt #
                    </Text>
                    <Text>
                        {res.data.entities.receiptNumber.data}
                    </Text>
                    </HStack>
        
                    <HStack>
                    <Text width={100}>
                        Tax
                    </Text>
        
                    <Text>{res.data.entities.multiTaxLineItems[0].data.taxAmount.text}</Text>
                    </HStack>
        
                    <HStack>
                    <Text width={100}>
                        Merchant
                    </Text>
        
                    <Text>{res.data.merchantName.data}</Text>
                    <Text>{res.data.merchantCity.text}</Text>
        
                    </HStack>
                </Box>
        
                <Box overflowX="auto" mt={10}>
                    <Text fontWeight="medium">Items</Text>
                    <Divider mb={4} />
                    <Box>
                    <DataTable size="xs" columns={[{ "accessor": "data", "Header": "Currency" }, { "accessor": "currencyCode", "Header": "Name" }, { "accessor": "text", "Header": "Item" }]} data={res.data.amounts} />
                    </Box>
        
                    <Box overflowX="auto" mt={10}>
                    <Text fontWeight="medium">Full JSON response</Text>
                    <Divider mb={4} />
                    <pre style={{ "fontSize": "12px", "height": "400px", overflow: "scroll", }}>
                        {JSON.stringify(res, null, 2)}
                    </pre>
                    </Box> </Box>
                </Box>}
            </Box>
        </Container>
    );
}

export default ReadWords