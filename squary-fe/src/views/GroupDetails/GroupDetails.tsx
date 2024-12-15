import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GroupOptions from "../../components/GroupOptions/GroupOptions";
import GroupExpenses from "../../components/GroupOptions/GroupExpenses/GroupExpenses";
import GroupBalances, {
  fetchBalances,
} from "../../components/GroupOptions/GroupBalances/GroupBalances";
import {
  Card
} from "@/components/ui/card";

interface Balance {
  id: string;
  member: string;
  balance: string; // Manejo como string para BigNumber
}
const GroupDetails = () => {
  const { groupId, groupName } = useParams<{ groupId: string; groupName: string }>();
  const [balances, setBalances] = useState<Balance[]>([]);

  if (!groupId || !groupName) {
    return <div>Error: No se encontró el ID o el nombre del grupo.</div>;
  }

  const updateBalances = async () => {
    try {
      const fetchedBalances: Balance[] = await fetchBalances(groupId);
      setBalances(fetchedBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    updateBalances();
  }, [groupId]);

  return (
    <div className="flex flex-col h-full gap-6 p-4">
      {/* Opciones del grupo */}
      <GroupOptions
        groupId={groupId}
        groupName={groupName}
        onBalancesUpdate={updateBalances}
      />
  
      {/* Contenedor de Expenses y Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        {/* Expenses */}
        <Card className="flex flex-col h-full">
          <div className="bg-white p-4 rounded-lg shadow-sm flex-grow">
            <GroupExpenses groupId={groupId} />
          </div>
        </Card>
  
        {/* Balances */}
        <Card className="flex flex-col h-full">
          <div className="bg-white p-4 rounded-lg shadow-sm flex-grow">
            <GroupBalances balances={balances} groupId={groupId} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GroupDetails;