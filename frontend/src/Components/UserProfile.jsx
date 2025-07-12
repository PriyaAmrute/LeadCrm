import React from 'react';
import './profile.css';

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const initial = user?.name?.charAt(0).toUpperCase();

  return (
    <div className="user-profile">
      {user?.profile ? (
        <img
          src={user.profile}
          alt="User Profile"
          className="user-profile-img"
          onError={(e) => {
            e.target.style.display = 'none';
            document.getElementById('fallback-initial').style.display = 'flex';
          }}
        />
      ) : (
        <div id="fallback-initial" className="avatar-initial">
          {initial}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
