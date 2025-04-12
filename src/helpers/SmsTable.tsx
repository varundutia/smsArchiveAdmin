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
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  simNumber?: string;
}

const SmsTable: React.FC = () => {
  const [smsData, setSmsData] = useState<SmsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterSimNumber, setFilterSimNumber] = useState<string>("");

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

  const deleteAllSms = async () => {
    try {
      setLoading(true);
      const batchDelete = smsData.map((sms) => deleteDoc(doc(db, "messages", sms.id)));
      await Promise.all(batchDelete);
      setSmsData([]);
      setSnackbar({ open: true, message: "All messages deleted successfully", severity: "success" });
    } catch (error) {
      console.error("Error deleting all SMS:", error);
      setSnackbar({ open: true, message: "Failed to delete all messages", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filteredSmsData = smsData.filter((sms) =>
    sms.simNumber?.toLowerCase().includes(filterSimNumber.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2>SMS Messages</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Filter by SIM number"
          value={filterSimNumber}
          onChange={(e) => setFilterSimNumber(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            maxWidth: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            color: "#fff",
          }}
        />
      </div>

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
                <TableCell><strong>SIM Number</strong></TableCell>
                <TableCell>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>Action</strong>
                    {smsData.length > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={deleteAllSms}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete All
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSmsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No Messages Found</TableCell>
                </TableRow>
              ) : (
                filteredSmsData.map((sms) => (
                  <TableRow key={sms.id}>
                    <TableCell>{sms.sender}</TableCell>
                    <TableCell style={{ maxWidth: "400px", wordWrap: "break-word" }}>{sms.message}</TableCell>
                    <TableCell>{new Date(sms.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{sms.simNumber || "N/A"}</TableCell>
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

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SmsTable;
