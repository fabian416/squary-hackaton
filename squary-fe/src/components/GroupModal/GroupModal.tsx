import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styles from './GroupModal.module.css';
import { useAccount } from 'wagmi'; 
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card";

interface GroupModalProps {
  show: boolean;
  handleClose: () => void;
  createGroup: (groupName: string, members: string[], tokenAddress: string) => Promise<void>;
  onGroupCreated: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ show, handleClose, createGroup, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [membersInput, setMembersInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [tokenAddress, setTokenAddress] = useState('');
  const { address } = useAccount();

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddMembers = () => {
    const newMembers = membersInput
      .split(',')
      .map(member => member.trim())
      .filter(member => isValidAddress(member));

    if (newMembers.length > 0) {
      setMembers([...members, ...newMembers]);
      setMembersInput('');
    } else {
      alert('Please enter valid Ethereum addresses.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!groupName || !tokenAddress || members.length === 0) {
      alert('Please fill in all fields and add at least one member.');
      return;
    }

    const allMembers = [address, ...members].filter(Boolean) as string[];
    await createGroup(groupName, allMembers, tokenAddress);
    onGroupCreated();
    handleModalClose();
  };

  const handleModalClose = () => {
    setGroupName('');
    setMembersInput('');
    setMembers([]);
    setTokenAddress('');
    handleClose();
  };

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  
    return () => {
      document.body.style.overflow = "auto"; // Limpia el estilo al desmontar
    };
  }, [show]);

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button className="w-full">Add</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="space-y-8">
              <Label htmlFor="groupName"></Label>
              <Input
                id="groupName"
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter Group Name"
                className="my-4"
              />
              <div className="flex items-center justify-center">
                <Label htmlFor="members"></Label>
                <Input
                  id="members"
                  onChange={(e) => setMembersInput(e.target.value)}
                  placeholder="Enter Ethereum address"
                  className="my-2"
                />
            
                <Button type="button" onClick={handleAddMembers} className="ml-2">+</Button>
              </div>
              {members.length > 0 && 
                <ul>
                  {members.map((member, index) => (
                    <Card className="p-3 my-2">
                      <li key={index} className="ml-2">{member}</li>
                    </Card>
                  ))}
                </ul>
              }
              <Label htmlFor="currency"></Label>
              <Select onValueChange={(value) => setTokenAddress(value)}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0x7Bf4dC86937EB387807d09f935D3a5c3A2888119">USDC</SelectItem>
                  <SelectItem value="0x04F2993B25AFDee6d9020d42cBAaD667FD35f458">USDT</SelectItem>
                  <SelectItem value="0x6B175474E89094C44Da98b954EedeAC495271d0F">DAI</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="w-full">Create Group</Button>
              </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default GroupModal;
