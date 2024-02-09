import Row from './Row';
import RowHeader from './RowHeader';
import React, { useState, useEffect } from 'react';
import { SpinningCircles } from 'react-loading-icons'

// use this website to change loading icon https://www.npmjs.com/package/react-loading-icons

export default function MainPageContainer(): React.JSX.Element {
  //create an array of row components
  let rows: React.JSX.Element[] = [];

  // initialize our state
  const [dependencies, setDependencies] = useState([]);
  const [isLoading, setLoading] = useState(true)
  const [filters, setFilters] = useState<string[]>(['stable', 'updateAvailable', 'removed']);
  
  // make a fetch request to our backend at the route /dependencies.
  // call a useEffect here to fetch our data when the page loads and update state.
  // Our dependency array is an empty array, so that this only happens once on page load
  useEffect(() => {
    async function getDependencies() {
      let response = await fetch('/dependencies');
      const responseData = await response.json()
      //sort the response data alphabetically by deprecation status
      responseData.sort((a: any, b:any) => {
        if (a.deprecationStatus < b.deprecationStatus) return -1;
        if (a.deprecationStatus > b.deprecationStatu) return 1;
        return 0;
      })
      setDependencies(responseData);
      setLoading(false);
    }
    getDependencies();
  }, []);

  function updateFilters(status: string){
    //if the filter is already applied, remove it from the filters array
    if(filters.includes(status)){
      const newFilters: string[] = [...filters]
      newFilters.splice(newFilters.indexOf(status),1);
      setFilters(newFilters);
    }
    // if the filter is not already applied, add it to the filters array
    else {
      setFilters([...filters, status]);
    }
  }

  //iterate through state to make all of our rows, and push them into the array
  for (const dependency of dependencies) {
    // for each subarray, create a new row, passing in the data from data, 
    // which we get from a fetch request to the back end
    if(filters.includes(dependency.deprecationStatus)){
      rows.push(<Row key={dependency.location + dependency.apiVersion} api={dependency.apiVersion} status={dependency.deprecationStatus} location={dependency.name}
      stable={dependency.newVersion ? dependency.newVersion : 'Up to date'} notes={dependency.description ? dependency.description : 'NA'} />);        
    }
  }

  return (
    <div className='mainPageContainer'>
      <RowHeader key={'row-header-key'} api='API' status='STATUS' location='LOCATION' stable='STABLE VERSION' notes='NOTES' filters={filters} filter={updateFilters}/>
      {isLoading? <SpinningCircles className="content-loading" /> : null}
      <div className='row-content-container'>
        {rows}        
      </div>
    </div>
  )
}