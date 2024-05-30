import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "@context";
import { LogoFull } from "@components/Logo";
import styles from "./styles/NavBar.module.sass";
import placeholder from "@img/placeholder.jpg";
import { BoxArrowRight } from "react-bootstrap-icons";
import Button from "./Button";

function NavBar() {
  const { isLoggedIn, logOutUser, user } = useContext(AuthContext);
  const location = useLocation();

  const renderLogo = () => {
    let size = "300px";
    if (location.pathname === "/dashboard") {
      size = "550px";
    }
    if (location.pathname === "/") size = "800px";

    return (
      <NavLink to="/">
        <LogoFull color="#D6F487" size={size} />
      </NavLink>
    );
  };

  const renderAuthLinks = () => (
    <>
      {location.pathname !== "/login" && (
        <Button to="/login" className={styles.navlink}>
          Login
        </Button>
      )}
      {location.pathname !== "/signup" && (
        <Button to="/signup" className={styles.navlink}>
          Signup
        </Button>
      )}
    </>
  );

  return (
    <div>
      <div
        className={
          location.pathname === "/dashboard" ? styles.centerLogo : styles.navbar
        }
      >
        <div>{renderLogo()}</div>
        <div>{!isLoggedIn && renderAuthLinks()}</div>
        {isLoggedIn && (
          <div className={styles.navbarButtons}>
            <Button to="/" className={styles.navlink} onClick={logOutUser}>
              <BoxArrowRight size="20" />
            </Button>
            {location.pathname === "/dashboard/history" && (
              <Button to="/dashboard" className={styles.navlink}>
                Dashboard
              </Button>
            )}
          </div>
        )}
      </div>
      {isLoggedIn && (
        <div className={styles.navbar_bottom}>
          <div>
            {user && (
              <div className="user-picture">
                <img
                  src={user.profileImg || placeholder}
                  onError={(e) => {
                    e.target.src = placeholder;
                  }}
                  alt={user.name}
                  className={styles.navbar_userProfile}
                />
              </div>
            )}
          </div>
          <div>
            {location.pathname === "/dashboard" && (
              <div className="history-button">
                <Button
                  to="/dashboard/history"
                  type="primary"
                  className={styles.navlink}
                >
                  History
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NavBar;
