import React from "react";
import { Link } from "react-router-dom";

function FeatureGrid({ features }) {
  return (
    <div className="feature-grid">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <Link className="feature-card" to={feature.path} key={feature.path}>
            <span className="feature-icon" aria-hidden="true">
              <Icon size={22} />
            </span>
            <span>
              <strong>{feature.title}</strong>
              <small>{feature.description}</small>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default FeatureGrid;
