import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HardwareWallets from "@/app/components/modals/Wallet/HardwareWallets";
import Eth from "@ledgerhq/hw-app-eth";
import Btc from "@ledgerhq/hw-app-btc";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { CHAINS } from "@/utils/wallet/constants";

// Mock dependencies
jest.mock("@ledgerhq/hw-transport-webusb");
jest.mock("@ledgerhq/hw-app-eth");
jest.mock("@ledgerhq/hw-app-btc");

describe("HardwareWallets Component", () => {
  const onBackMock = jest.fn();
  const onWalletSelectMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(
      <HardwareWallets
        onBack={onBackMock}
        onWalletSelect={onWalletSelectMock}
        selectedChains={[CHAINS[5]]}
        isDisabled={false}
      />,
    );

    expect(screen.getByText("Hardware Wallets")).toBeInTheDocument();
    expect(screen.getByText("Ledger")).toBeInTheDocument();
  });

  it("triggers onBack when the back button is clicked", () => {
    render(
      <HardwareWallets
        onBack={onBackMock}
        onWalletSelect={onWalletSelectMock}
        selectedChains={[CHAINS[5]]}
        isDisabled={false}
      />,
    );

    fireEvent.click(screen.getByText("Hardware Wallets"));
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it("connects to Ledger and retrieves the address for Ethereum", async () => {
    const mockTransport = { close: jest.fn() };
    const mockGetAddress = jest.fn().mockResolvedValue({ address: "0x1234" });
    (TransportWebUSB.create as jest.Mock).mockResolvedValue(mockTransport);
    (Eth as jest.Mock).mockImplementation(() => ({
      getAddress: mockGetAddress,
    }));

    render(
      <HardwareWallets
        onBack={onBackMock}
        onWalletSelect={onWalletSelectMock}
        selectedChains={[CHAINS[5]]}
        isDisabled={false}
      />,
    );

    fireEvent.click(screen.getByText("Ledger"));

    expect(screen.getByText("Connecting...")).toBeInTheDocument();

    await waitFor(() => {
      expect(onWalletSelectMock).toHaveBeenCalledWith("ledger", "0x1234");
      expect(mockTransport.close).toHaveBeenCalled();
    });
  });

  it("connects to Ledger and retrieves the address for Bitcoin", async () => {
    const mockTransport = { close: jest.fn() };
    const mockGetWalletPublicKey = jest
      .fn()
      .mockResolvedValue({ bitcoinAddress: "bc1abc" });
    (TransportWebUSB.create as jest.Mock).mockResolvedValue(mockTransport);
    (Btc as jest.Mock).mockImplementation(() => ({
      getWalletPublicKey: mockGetWalletPublicKey,
    }));

    render(
      <HardwareWallets
        onBack={onBackMock}
        onWalletSelect={onWalletSelectMock}
        selectedChains={[CHAINS[1]]}
        isDisabled={false}
      />,
    );

    fireEvent.click(screen.getByText("Ledger"));

    await waitFor(() => {
      expect(onWalletSelectMock).toHaveBeenCalledWith("ledger", "bc1abc");
      expect(mockTransport.close).toHaveBeenCalled();
    });
  });

  it("displays an error if connecting to Ledger fails", async () => {
    (TransportWebUSB.create as jest.Mock).mockRejectedValue(
      new Error("Connection failed"),
    );

    render(
      <HardwareWallets
        onBack={onBackMock}
        onWalletSelect={onWalletSelectMock}
        selectedChains={[CHAINS[5]]}
        isDisabled={false}
      />,
    );

    fireEvent.click(screen.getByText("Ledger"));

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });
  });
});
