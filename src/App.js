import React, { useState, useEffect } from 'react';
import './App.css';

function CheckboxTree({ data }) {
  const [selected, setSelected] = useState([]);

  const getDescendants = (item) => {
    let descendants = [item.id];
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        descendants = [...descendants, ...getDescendants(child)];
      });
    }
    return descendants;
  };

  const areAllChildrenUnchecked = (children) => {
    return children.every(child => !selected.includes(child.id));
  };

  const handleChange = (id, children) => {
    const descendants = getDescendants({ id, children });

    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => !descendants.includes(item));
      } else {
        return [...prevSelected, ...descendants];
      }
    });
  };

  const handleChildUncheck = (childId, parentId, children) => {
    setSelected((prevSelected) => {
      const newSelected = prevSelected.filter(item => item !== childId);
      if (areAllChildrenUnchecked(children)) {
        return newSelected.filter(item => item !== parentId);
      }

      return newSelected;
    });
  };

  const renderTree = (items, parentId = null) => {
    return items?.map((item) => {
      const isChecked = selected.includes(item.id);

      const onChange = () => handleChange(item.id, item.children || []);

      const handleChildChange = (childId) => {
        setSelected((prevSelected) => {
          if (prevSelected.includes(childId)) {
            return prevSelected.filter((item) => item !== childId);
          } else {
            return [...prevSelected, childId];
          }
        });
        
        if (item.children && item.children.length > 0) {
          handleChildUncheck(childId, item.id, item.children);
        }
      };

      return (
        <div key={item.id} style={{ marginLeft: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onChange} 
            />
            {item.menu_label_name}
          </label>
          {item.children && item.children.length > 0 && (
            <div>{renderTree(item.children, item.id)}</div>
          )}
        </div>
      );
    });
  };

  return <div>{renderTree(data)}</div>;
}

function App() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://192.168.93.187:8000/api/v1/menu/menu/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Sample Menu</h1>
      {menuData && <CheckboxTree data={menuData} />}
    </div>
  );
}

export default App;
