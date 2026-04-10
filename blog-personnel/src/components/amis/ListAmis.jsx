function ListAmis({ friends, incomingRequests, outgoingRequests, onAccept, onRemove, onBlock }) {
  return (
    <div className="stack-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Demandes reçues</h2>
            <p>Acceptez les invitations en attente.</p>
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <p className="empty-state">Aucune demande reçue pour le moment.</p>
        ) : (
          <div className="user-grid">
            {incomingRequests.map((request) => (
              <article className="user-card" key={request.id}>
                <div>
                  <h3>{request.requester?.fullName}</h3>
                  <p>@{request.requester?.username}</p>
                </div>
                <button className="btn btn-primary" onClick={() => onAccept(request.id)}>
                  Accepter
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Invitations envoyées</h2>
            <p>Suivi de vos demandes en attente.</p>
          </div>
        </div>

        {outgoingRequests.length === 0 ? (
          <p className="empty-state">Aucune invitation en attente.</p>
        ) : (
          <div className="user-grid">
            {outgoingRequests.map((request) => (
              <article className="user-card" key={request.id}>
                <div>
                  <h3>{request.recipient?.fullName}</h3>
                  <p>@{request.recipient?.username}</p>
                </div>
                <span className="tag tag-neutral">En attente</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Liste des amis</h2>
            <p>Supprimez une relation ou bloquez un utilisateur si nécessaire.</p>
          </div>
        </div>

        {friends.length === 0 ? (
          <p className="empty-state">Vous n’avez encore aucun ami confirmé.</p>
        ) : (
          <div className="user-grid">
            {friends.map((friend) => (
              <article className="user-card" key={friend.id}>
                <div>
                  <h3>{friend.fullName}</h3>
                  <p>@{friend.username}</p>
                </div>
                <div className="card-actions compact-actions">
                  <button className="btn btn-secondary" onClick={() => onRemove(friend.id)}>
                    Retirer
                  </button>
                  <button className="btn btn-danger" onClick={() => onBlock(friend.id)}>
                    Bloquer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ListAmis;
