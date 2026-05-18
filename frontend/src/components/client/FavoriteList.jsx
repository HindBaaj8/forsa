import WorkerCard from '../common/WorkerCard';

{ favorites.map(fav => (
  <WorkerCard
    key={fav.id}
    worker={fav.worker || fav}
    onContact={() => handleContact(fav.worker_id)}
    onFavorite={() => handleFavorite(fav.worker_id)}
    isFavorite={true}
  />
))}