import { Button, Card, CardActionArea, CardActions, CardContent, CardHeader, Typography } from '@mui/material'
import axios from 'axios'
import React from 'react'


/**
 * The below components shows the working example of axios for API calls.
 * Also Material UI is integrated for design.
 */
function TestingAPI() {

    const [testData, setTestData] = React.useState(undefined);

    return (
        <Card style={{ width: "320px", margin: "20px", padding: "20px" }}>
            <CardHeader title="Test Component"></CardHeader>
            <CardContent>
                <Typography variant='body1'>Result: {testData ?? "(Click button below)"}</Typography>
            </CardContent>
            <CardActions>
                <Button
                    variant="contained"
                    onClick={async () => {
                        const response = await axios.get(`http://localhost:8000`);
                        setTestData(response.data);
                    }}>
                    Click to Test
                </Button>
            </CardActions>

            <CardActionArea>
                <Typography variant='caption'>You can make all the changes here -{'>'} <u><em>src/Posts/index.js</em></u> </Typography>
            </CardActionArea>

        </Card>


    )
}

export default function Posts() {
    // You can delete testingAPI component and start your assignment.    
    return <TestingAPI />
}
