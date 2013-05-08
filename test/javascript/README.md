## How does it work?

1. Install **node** dependencies

    ```sh
        npm install
    ```

2. Exeucte the app server

    ```sh
       make app
    ```

3. Execute your ghostdriver code version

    ```sh
       make ghostdriver
    ```

4. Execute the test

    ```sh
       make test
    ```
5. Optional for stop on the first fail
    ```sh
       make test MOCHA_OPTS="-b --check-leaks"
    ```
