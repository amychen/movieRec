import csv

def mergeFiles(filename1, filename2):
    with open(filename1) as movies_file, open(filename2) as review_file, open('View2/moviesReview.csv', 'w') as moviesReview_file:
        movies_reader = csv.reader(movies_file)
        reviews_reader = csv.reader(review_file)
        movies_review = csv.writer(moviesReview_file)

        new_row = []
        for line in reviews_reader:
            new_row.append(line)

        for idx, line in enumerate(movies_reader):
            title = ' '.join(line[1].split(' ')[:-1]) if idx != 0 else "title"
            year = line[1].split('(')[-1][:-1] if idx != 0 else "year"
            new_row[idx][0] = title
            new_row[idx].append(year)
            movies_review.writerow(new_row[idx])

def main():
   mergeFiles('View2/movies.csv', 'View2/review.csv')

if __name__ == "__main__":
    main()