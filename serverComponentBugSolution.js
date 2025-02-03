// serverComponentBugSolution.js
import { Suspense } from 'react';

async function fetchData(id) {
  try {
    const res = await fetch(`https://api.example.com/data/${id}`);
    if (!res.ok) {
      throw new Error(`API error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw to be caught by the parent
  }
}

async function fetchData2(data) {
  try {
    const res = await fetch(`https://api.example.com/data2/${data.id}`);
    if (!res.ok) {
      throw new Error(`API error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching data2:', error);
    throw error; // Re-throw to be caught by the parent
  }
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyComponent/>
    </Suspense>
  );
}

function MyComponent() {
  const { data, error } = useAsync(async () => {
    const data1 = await fetchData(123);
    const data2 = await fetchData2(data1);
    return data2;
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } 

  if (!data) {
    return null;
  }
  return (
    <div>Data: {JSON.stringify(data)}</div>
  );
}

function useAsync(asyncFunction, inputs) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    asyncFunction().then(data => {
      if(isMounted) {
        setData(data);
        setLoading(false);
      }
    }).catch(error => {
      if(isMounted) {
        setError(error);
        setLoading(false);
      }
    }).finally(() => {
      isMounted = false;
    });
    return () => controller.abort();
  }, [...inputs]);
  return { data, error, loading };
}