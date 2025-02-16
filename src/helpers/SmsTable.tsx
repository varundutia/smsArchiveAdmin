import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

// MUI Components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface SmsData {
  id: string; // Document ID
  sender: string;
  message: string;
  timestamp: number;
}

const SmsTable: React.FC = () => {
  const [smsData, setSmsData] = useState<SmsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchSmsData();
  }, []);

  const fetchSmsData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "messages"));
      const fetchedData: SmsData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SmsData[];
      console.log(fetchedData);

      setSmsData(fetchedData);
    } catch (error) {
      console.error("Error fetching SMS data:", error);
      setSnackbar({ open: true, message: "Failed to fetch data", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteSms = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      setSmsData((prevData) => prevData.filter((sms) => sms.id !== id));
      setSnackbar({ open: true, message: "Message deleted successfully", severity: "success" });
    } catch (error) {
      console.error("Error deleting SMS:", error);
      setSnackbar({ open: true, message: "Failed to delete message", severity: "error" });
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2>SMS Messages</h2>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Sender</strong></TableCell>
                <TableCell><strong>Message</strong></TableCell>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {smsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No Messages Found</TableCell>
                </TableRow>
              ) : (
                smsData.map((sms) => (
                  <TableRow key={sms.id}>
                    <TableCell>{sms.sender}</TableCell>
                    <TableCell style={{ maxWidth: "400px", wordWrap: "break-word" }}>
                      {sms.message}
                    </TableCell>
                    <TableCell>{new Date(sms.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteSms(sms.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SmsTable;