//send to storate
export const getToken = () => {
  const token = localStorage.getItem("jwt");
  if (token) {
    return token;
  } else {
    console.error("Token not found");
    return null;
  } 
}
export const postTransaction1 = (
    reference: string, 
    amount: number,
    rate: number,
    product: string,
    biller: string,
    phone: string,
    email: string,
    fullname: string,
    status: string,
    statusMessage: string,
  )=>{
    const url = import.meta.env.VITE_API_ROOT + "/pay";
    fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reference: `${reference}`,
            amount: amount,
            rate: rate,
            product: `${product}`,
            biller: `${biller}`,
            phone: `${phone}`,
            email: `${email}`,
            fullname: `${fullname}`,
            status: `${status}`,
            statusMessage: `${statusMessage}`, 
          }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('postTransaction failed');
          }
          return response.json(); // 👈 retrieve JWT as plain text
        })
        .then(data => {
          console.log('postTransaction data:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });

  }
  export const postTransaction = async (transaction: {
    reference: string;
    amount: number;
    rate: number;
    product: string;
    biller: string;
    phone: string;
    email: string;
    fullname: string;
    status: string;
    statusMessage: string;
  }): Promise<any> => {
    const url = import.meta.env.VITE_API_ROOT + "/pay"; // Replace with your endpoint URL
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction), // Send the transaction object as the request body
      });
  
      if (!response.ok) {
        throw new Error("postTransaction failed");
      }
  
      const data = await response.json(); // Parse the JSON response
      return data; // Return the parsed response
    } catch (error) {
      console.error("Error posting transaction:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
export const postPayBill = async (payBill: any): Promise<any> => {
  const url = import.meta.env.VITE_API_VAS + "/process/pay"; // Replace with your endpoint URL

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // Add Authorization header with the token
      },
      body: JSON.stringify(payBill),
    });

    if (!response.ok) {
      throw new Error("Failed to post payBill");
    }

    const payBillResp = await response.json();

    // Return the parsed response
    return payBillResp;
  } catch (error) {
    console.error("Error posting payBill:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};