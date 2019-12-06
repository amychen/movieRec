import csv

def convertToCSV(filename):
    with open('ml-1m/' + filename + ".dat") as dat_file, open('ml-1m/' + filename + '.csv', 'w') as csv_file:
        csv_writer = csv.writer(csv_file)

        for line in dat_file:
            row = [field.strip() for field in line.split('::')]
            csv_writer.writerow(row)

def main():
   convertToCSV('movies'); 
   convertToCSV('ratings'); 
   convertToCSV('users'); 

if __name__ == "__main__":
    main()




