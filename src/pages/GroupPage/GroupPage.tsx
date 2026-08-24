import { useParams } from "react-router";

function GroupPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Group</h1>
      <p>Group ID: {id}</p>
    </div>
  );
}

export default GroupPage;