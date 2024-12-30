export const renderStars = (rating: number) => {
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
};
export const formatDate = (timestamp: number): string => {
  const newDate = new Date(timestamp);
  return (
    newDate.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) +
    ' ' +
    newDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
};